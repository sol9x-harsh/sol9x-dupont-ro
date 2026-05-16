'use client';
import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize, Focus } from 'lucide-react';

interface StageConfig { vessels: number; elements: number; }
export interface PassConfig { label: string; recovery: number; stages: StageConfig[]; }

interface Props {
  passes?: PassConfig[];
  feedFlow?: number; permeateFlow?: number; rejectFlow?: number;
  recovery?: number; pumpPressure?: number;
  feedTDS?: number; permeateTDS?: number; rejectTDS?: number;
  stages?: StageConfig[]; boosterPressures?: number[][];
  stage1?: StageConfig; stage2?: StageConfig; stage3?: StageConfig;
}

// ── Color tokens ────────────────────────────────────────────────────────────
const C = {
  feed:     '#0d9488', // Teal
  permeate: '#2563eb', // Blue
  inter:    '#d97706', // Orange
  reject:   '#be123c', // Red
  bg:       '#ffffff',
  text:     '#0f172a',
  muted:    '#64748b'
};

// ── Layout constants ─────────────────────────────────────────────────────────
const STAGE_W = 100;
const STAGE_H = 30;
const STAGE_GAP_X = 110;
const STAGE_GAP_Y = 64;

const FLOW_Y = 280;
const PERIM_Y = 380;
const REJECT_Y = 70;
const SVG_H = 460;
const PASS_SEP = 80;

function passW(nStages: number): number {
  return 120 + nStages * STAGE_W + Math.max(0, nStages - 1) * STAGE_GAP_X + 40;
}

function stg_cx(passX: number, stgIdx: number) {
  return passX + 120 + STAGE_W / 2 + stgIdx * (STAGE_W + STAGE_GAP_X);
}
function stg_cy(stgIdx: number) {
  return FLOW_Y - stgIdx * STAGE_GAP_Y;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function roundedPath(points: [number, number][], r: number = 8): string {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    
    const dx0 = p0[0] - p1[0];
    const dy0 = p0[1] - p1[1];
    const len0 = Math.hypot(dx0, dy0);
    const nx0 = len0 === 0 ? 0 : dx0 / len0;
    const ny0 = len0 === 0 ? 0 : dy0 / len0;
    
    const dx2 = p2[0] - p1[0];
    const dy2 = p2[1] - p1[1];
    const len2 = Math.hypot(dx2, dy2);
    const nx2 = len2 === 0 ? 0 : dx2 / len2;
    const ny2 = len2 === 0 ? 0 : dy2 / len2;
    
    const rActual = Math.min(r, len0 / 2, len2 / 2);
    
    const startX = p1[0] + nx0 * rActual;
    const startY = p1[1] + ny0 * rActual;
    
    const endX = p1[0] + nx2 * rActual;
    const endY = p1[1] + ny2 * rActual;
    
    d += ` L ${startX} ${startY} Q ${p1[0]} ${p1[1]} ${endX} ${endY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last[0]} ${last[1]}`;
  return d;
}

const FlowPath = ({ pts, color, markerEnd }: { pts: [number, number][], color: string, markerEnd?: string }) => {
  const d = roundedPath(pts, 8);
  return <path d={d} fill='none' stroke={color} strokeWidth='2.5' strokeLinejoin='round' markerEnd={markerEnd} />;
};

const Marker = ({ id, color }: { id: string; color: string }) => (
  <marker id={id} viewBox='0 0 10 10' refX='6' refY='5' markerWidth='6' markerHeight='6' orient='auto'>
    <polygon points='0,2 8,5 0,8' fill={color} />
  </marker>
);

const InlineBadge = ({ x, y, label, color, tooltip }: { x: number; y: number; label: string; color: string; tooltip?: string }) => (
  <g transform={`translate(${x},${y})`}>
    {tooltip && <title>{tooltip}</title>}
    <rect x={-14} y={-9} width={28} height={18} rx='4' fill={C.bg} stroke={color} strokeWidth='1.5' filter='url(#shadow)' />
    <text x={0} y={3} textAnchor='middle' fontSize='9' fontWeight='700' fill={color} fontFamily='"IBM Plex Mono",monospace'>{label}</text>
  </g>
);

const DataBadge = ({ x, y, title, val1, val2, color, tooltip }: { x: number; y: number; title: string; val1: string; val2: string; color: string; tooltip?: string }) => (
  <g transform={`translate(${x},${y})`}>
    {tooltip && <title>{tooltip}</title>}
    <rect x={-55} y={-24} width={110} height={48} rx='6' fill='#ffffff' stroke={color} strokeWidth='1.5' filter='url(#shadow)' />
    <text x='0' y='-10' textAnchor='middle' fontSize='8' fontWeight='800' fill={color} className="uppercase tracking-widest">{title}</text>
    <text x='0' y='5' textAnchor='middle' fontSize='11' fontWeight='700' fontFamily='"IBM Plex Mono",monospace' fill='#0f172a'>{val1}</text>
    <text x='0' y='17' textAnchor='middle' fontSize='9' fontWeight='600' fontFamily='"IBM Plex Mono",monospace' fill='#64748b'>({val2})</text>
  </g>
);

// ── P&ID Mechanical Symbols ───────────────────────────────────────────────────

const Valve = ({ x, y, tooltip }: { x: number; y: number; tooltip?: string }) => (
  <g transform={`translate(${x},${y})`} filter='url(#shadow)'>
    {tooltip && <title>{tooltip}</title>}
    <polygon points='-7,-6 7,6 7,-6 -7,6' fill='#ffffff' stroke='#334155' strokeWidth='1.5' strokeLinejoin='round' />
    <line x1='0' y1='0' x2='0' y2='-10' stroke='#334155' strokeWidth='1.5' />
    <line x1='-5' y1='-10' x2='5' y2='-10' stroke='#334155' strokeWidth='2' />
  </g>
);

const Gauge = ({ x, y, val, tooltip }: { x: number; y: number; val?: string; tooltip?: string }) => (
  <g filter='url(#shadow)'>
    {tooltip && <title>{tooltip}</title>}
    <line x1={x} y1={y} x2={x} y2={y - 16} stroke='#475569' strokeWidth='1.5' />
    <circle cx={x} cy={y - 24} r={8} fill='#ffffff' stroke='#475569' strokeWidth='1.5' />
    <path d={`M ${x-5} ${y-22} A 7 7 0 0 1 ${x+5} ${y-22}`} fill='none' stroke='#cbd5e1' strokeWidth='2' />
    <line x1={x} y1={y-24} x2={x+5} y2={y-28} stroke='#ef4444' strokeWidth='1.5' strokeLinecap='round' />
    <circle cx={x} cy={y-24} r={1.5} fill='#334155' />
    {val && <text x={x} y={y - 36} textAnchor='middle' fontSize='9' fontWeight='700' fill='#475569'>{val}</text>}
  </g>
);

const Sensor = ({ x, y, label, tooltip }: { x: number; y: number; label: string; tooltip?: string }) => (
  <g filter='url(#shadow)'>
    {tooltip && <title>{tooltip}</title>}
    <line x1={x} y1={y} x2={x} y2={y + 16} stroke='#475569' strokeWidth='1.5' />
    <circle cx={x} cy={y + 24} r={8} fill='#f1f5f9' stroke='#475569' strokeWidth='1.5' />
    <text x={x} y={y + 27} textAnchor='middle' fontSize='8' fontWeight='700' fill='#475569'>{label}</text>
  </g>
);

const Pump = ({ cx, cy = FLOW_Y, label, size = 16, tooltip, val }: { cx: number; cy?: number; label: string; size?: number; tooltip?: string; val?: string }) => (
  <g filter='url(#shadow)'>
    {tooltip && <title>{tooltip}</title>}
    <rect x={cx - size*0.8} y={cy + size*0.9} width={size*1.6} height={size*0.3} fill='#334155' />
    <line x1={cx - size*1.2} y1={cy + size*1.2} x2={cx + size*1.2} y2={cy + size*1.2} stroke='#334155' strokeWidth='2' />
    <circle cx={cx} cy={cy} r={size} fill='#f8fafc' stroke='#334155' strokeWidth='2' />
    <polygon points={`${cx - size*0.4},${cy + size*0.4} ${cx + size*0.5},${cy} ${cx - size*0.4},${cy - size*0.4}`} fill='#94a3b8' />
    <text x={cx} y={cy + size*1.2 + 12} textAnchor='middle' fontSize={size * 0.65} fontWeight='700' fill='#0f172a'>{label}</text>
    {val && <text x={cx} y={cy + size*1.2 + 24} textAnchor='middle' fontSize={size * 0.55} fontWeight='600' fill='#64748b' fontFamily='"IBM Plex Mono",monospace'>{val}</text>}
  </g>
);

const VesselBlock = ({ cx, cy, label, stage }: { cx: number; cy: number; label: string, stage: StageConfig }) => {
  const w = STAGE_W;
  const h = STAGE_H;
  const rx = h / 2;
  const left = cx - w / 2;
  const top = cy - h / 2;
  return (
    <g filter='url(#vessel-shadow)'>
      <title>{`${label}\n${stage.vessels} Pressure Vessels in Parallel\n${stage.elements} Elements per Vessel\nTotal Elements: ${stage.vessels * stage.elements}`}</title>
      <rect x={left} y={top} width={w} height={h} rx={rx} fill='url(#vessel-grad)' stroke='#475569' strokeWidth='1.5' />
      <path d={`M ${left + 14} ${top} L ${left + 14} ${top + h}`} stroke='#475569' strokeWidth='1.5' />
      <path d={`M ${left + w - 14} ${top} L ${left + w - 14} ${top + h}`} stroke='#475569' strokeWidth='1.5' />
      <rect x={left + 8} y={top} width={6} height={h} fill='#cbd5e1' />
      <rect x={left + w - 14} y={top} width={6} height={h} fill='#cbd5e1' />
      <line x1={left + 24} y1={top + h} x2={left + 44} y2={top} stroke='#94a3b8' strokeWidth='1' opacity='0.7' />
      <line x1={left + 44} y1={top + h} x2={left + 64} y2={top} stroke='#94a3b8' strokeWidth='1' opacity='0.7' />
      <line x1={left + 64} y1={top + h} x2={left + 84} y2={top} stroke='#94a3b8' strokeWidth='1' opacity='0.7' />
      
      <rect x={cx - 48} y={cy - 26} width={96} height={14} rx='2' fill='#ffffff' stroke='#94a3b8' strokeWidth='1' />
      <text x={cx} y={cy - 16} textAnchor='middle' fontSize='8' fontWeight='700' fill='#0f172a'>{label}</text>
      <text x={cx} y={cy + 26} textAnchor='middle' fontSize='9' fontWeight='600' fill='#64748b' fontFamily='"IBM Plex Mono",monospace'>
        {stage.vessels}V×{stage.elements}E
      </text>
    </g>
  );
};

// Node numbering logic
const getInterLabel = (p: number, i: number) => p === 0 ? `${5 + i}` : `${5 + i}${String.fromCharCode(64 + p)}`;
const getRejectLabel = (p: number) => p === 0 ? '10' : `10${String.fromCharCode(64 + p)}`;
const getPermLabel = (p: number) => p === 0 ? '20' : `20${String.fromCharCode(64 + p)}`;

// ── Main component ────────────────────────────────────────────────────────────
export function ProcessFlowDiagram({
  passes: passesProp,
  feedFlow = 0, permeateFlow = 0, rejectFlow = 0,
  recovery = 75, pumpPressure = 14.2,
  feedTDS = 0, permeateTDS = 0, rejectTDS = 0,
  stage1, stage2, stage3,
  stages: propStages,
  boosterPressures
}: Props) {
  const passes: PassConfig[] = passesProp ?? (() => {
    const s = propStages ?? ([stage1, stage2, stage3].filter(Boolean) as StageConfig[]);
    if (s.length === 0) s.push({ vessels: 8, elements: 7 });
    return [{ label: 'Pass 1', recovery, stages: s }];
  })();

  const passStarts: number[] = [];
  let curX = 160; 
  passes.forEach(p => {
    passStarts.push(curX);
    curX += passW(p.stages.length) + PASS_SEP;
  });
  
  const totalW = curX + 160;
  const svgW = Math.max(1000, totalW);

  return (
    <div className='relative w-full border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm'>
      <TransformWrapper 
        initialScale={1} 
        minScale={0.5} 
        maxScale={3} 
        centerOnInit={true} 
        centerZoomedOut={true} 
        limitToBounds={true}
        wheel={{ step: 0.04 }}
      >
        {({ zoomIn, zoomOut, resetTransform, centerView }) => (
          <>
            <div className='absolute bottom-5 right-5 z-20 flex gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-lg shadow-lg border border-slate-200/60'>
              <button onClick={() => zoomIn()} title='Zoom In' className='p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors'><ZoomIn size={18} /></button>
              <button onClick={() => zoomOut()} title='Zoom Out' className='p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors'><ZoomOut size={18} /></button>
              <button onClick={() => { resetTransform(); centerView(); }} title='Fit to Screen' className='p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors'><Focus size={18} /></button>
            </div>

            <TransformComponent wrapperStyle={{ width: "100%", height: "600px", minHeight: "600px", backgroundColor: "#f8fafc" }}>
              <div style={{ width: svgW, height: SVG_H }} className='relative mx-auto mt-8 mb-12'>
                <svg viewBox={`0 0 ${svgW} ${SVG_H}`} className='w-full h-full overflow-visible'>
                  <defs>
                    <linearGradient id="vessel-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f8fafc" />
                      <stop offset="30%" stopColor="#ffffff" />
                      <stop offset="70%" stopColor="#e2e8f0" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>
                    <pattern id='blueprint-grid' width='40' height='40' patternUnits='userSpaceOnUse'>
                      <rect width='40' height='40' fill='#f8fafc' />
                      <path d='M 40 0 L 0 0 0 40' fill='none' stroke='#e2e8f0' strokeWidth='1' />
                      <path d='M 10 0 L 10 40 M 20 0 L 20 40 M 30 0 L 30 40 M 0 10 L 40 10 M 0 20 L 40 20 M 0 30 L 40 30' fill='none' stroke='#f1f5f9' strokeWidth='0.5' />
                    </pattern>
                    <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" floodColor="#0f172a" />
                    </filter>
                    <filter id="vessel-shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" floodColor="#0f172a" />
                    </filter>
                    <Marker id='arr-feed' color={C.feed} />
                    <Marker id='arr-perm' color={C.permeate} />
                    <Marker id='arr-rej'  color={C.reject} />
                    <Marker id='arr-inter' color={C.inter} />
                  </defs>

                  {/* Blueprint Grid Background */}
                  <rect width="100%" height="100%" fill="#f8fafc" />
                  <rect width="100%" height="100%" fill="url(#blueprint-grid)" />

                  {/* ── DIAGRAM KEY (LEGEND) ── */}
                  <g transform={`translate(24, 24)`} filter='url(#shadow)'>
                    <rect width='170' height='140' fill='rgba(255,255,255,0.95)' stroke='#64748b' strokeWidth='1.5' rx='6' />
                    <text x='85' y='18' textAnchor='middle' fontSize='10' fontWeight='800' fill='#0f172a'>DIAGRAM KEY</text>
                    <line x1='12' y1='26' x2='158' y2='26' stroke='#cbd5e1' strokeWidth='1' />
                    <FlowPath pts={[[16, 42], [36, 42]]} color={C.feed} markerEnd='url(#arr-feed)' />
                    <text x='48' y='45' fontSize='9' fontWeight='600' fill='#0f172a'>Treated Feed Water</text>
                    <FlowPath pts={[[16, 64], [36, 64]]} color={C.permeate} markerEnd='url(#arr-perm)' />
                    <text x='48' y='67' fontSize='9' fontWeight='600' fill='#0f172a'>Permeate Product</text>
                    <FlowPath pts={[[16, 86], [36, 86]]} color={C.reject} markerEnd='url(#arr-rej)' />
                    <text x='48' y='89' fontSize='9' fontWeight='600' fill='#0f172a'>System Reject</text>
                    <Gauge x={26} y={130} />
                    <text x='48' y='109' fontSize='9' fontWeight='600' fill='#0f172a'>Pressure Gauge</text>
                  </g>

                  {/* ── MAIN REJECT HEADER ── */}
                  {(() => {
                    const firstRejectX = stg_cx(passStarts[0], passes[0].stages.length - 1) + STAGE_W / 2 + 20;
                    const endX = totalW - 80;
                    return (
                      <g>
                        <FlowPath pts={[[firstRejectX, REJECT_Y], [endX, REJECT_Y]]} color={C.reject} markerEnd='url(#arr-rej)' />
                        <InlineBadge x={endX - 30} y={REJECT_Y} label='21' color={C.reject} tooltip='Final Concentrate Stream' />
                        <DataBadge x={endX + 40} y={REJECT_Y - 26} title='Final Concentrate' val1={`${rejectFlow.toFixed(1)} m³/h`} val2={`${rejectTDS.toFixed(0)} ppm`} color={C.reject} tooltip='Waste Stream Output' />
                        <Sensor x={endX - 70} y={REJECT_Y} label='TDS' tooltip={`Conductivity Sensor\n${rejectTDS.toFixed(0)} ppm`} />
                      </g>
                    );
                  })()}

                  {/* ── INITIAL FEED ── */}
                  <FlowPath pts={[[10, FLOW_Y], [passStarts[0] - 30, FLOW_Y]]} color={C.feed} />
                  <DataBadge x={70} y={FLOW_Y - 26} title='Raw Water Feed' val1={`${feedFlow.toFixed(1)} m³/h`} val2={`${feedTDS.toFixed(0)} ppm`} color={C.feed} tooltip='Primary Inlet Feed' />
                  
                  {/* ── PASS LOOP ── */}
                  {passes.map((pass, passIdx) => {
                    const isFirstPass = passIdx === 0;
                    const isLastPass = passIdx === passes.length - 1;
                    const feedColor = isFirstPass ? C.feed : C.permeate;
                    const numStages = pass.stages.length;
                    const passX = passStarts[passIdx];
                    
                    const labelFeed = isFirstPass ? '1' : getPermLabel(passIdx - 1);
                    const labelReject = getRejectLabel(passIdx);
                    const labelPerm = getPermLabel(passIdx);
                    const feedStartX = isFirstPass ? 10 : passX - 30;

                    return (
                      <g key={`pass-${passIdx}`}>
                        <rect x={passX + 15} y={FLOW_Y - 56} width='70' height='20' rx='4' fill='#1e293b' filter='url(#shadow)' />
                        <text x={passX + 50} y={FLOW_Y - 42} textAnchor='middle' fontSize='10' fontWeight='700' fill='#ffffff' letterSpacing='0.5'>
                          PASS {passIdx + 1}
                        </text>

                        {/* 1. Feed to Stage 0 */}
                        <FlowPath pts={[[feedStartX, FLOW_Y], [stg_cx(passX, 0) - STAGE_W/2 - 2, FLOW_Y]]} color={feedColor} markerEnd={`url(#arr-${isFirstPass ? 'feed' : 'perm'})`} />
                        <InlineBadge x={passX - 15} y={FLOW_Y} label={labelFeed} color={feedColor} tooltip={`Feed into Pass ${passIdx + 1}`} />
                        <Valve x={passX + 15} y={FLOW_Y} tooltip='Manual Isolation Valve' />
                        <Pump cx={passX + 60} cy={FLOW_Y} label={`P-${passIdx + 1}01`} size={16} val={`${passIdx === 0 ? pumpPressure.toFixed(1) : (pumpPressure * 0.8).toFixed(1)} bar`} tooltip={`High Pressure Feed Pump for Pass ${passIdx + 1}`} />
                        <Gauge x={passX + 100} y={FLOW_Y} tooltip='Feed Pressure Gauge' />

                        {/* 2. Inter-stage connections */}
                        {Array.from({ length: numStages - 1 }).map((_, i) => {
                          const cx1 = stg_cx(passX, i);
                          const cy1 = stg_cy(i);
                          const cx2 = stg_cx(passX, i + 1);
                          const cy2 = stg_cy(i + 1);
                          const midX = cx1 + STAGE_W/2 + 30;
                          const pumpX = cx2 - STAGE_W/2 - 44;
                          const bp = boosterPressures?.[passIdx]?.[i];
                          
                          return (
                            <g key={`inter-${i}`}>
                              <FlowPath pts={[[cx1 + STAGE_W/2, cy1], [midX, cy1], [midX, cy2], [cx2 - STAGE_W/2 - 2, cy2]]} color={C.inter} markerEnd='url(#arr-inter)' />
                              <InlineBadge x={midX} y={(cy1+cy2)/2} label={getInterLabel(passIdx, i)} color={C.inter} tooltip={`Inter-stage Concentrate to Stage ${i + 2}`} />
                              <Pump cx={pumpX} cy={cy2} label={`BP`} size={12} val={bp ? `${bp.toFixed(1)} bar` : undefined} tooltip={`Inter-stage Booster Pump`} />
                              <Gauge x={cx2 - STAGE_W/2 - 14} y={cy2} tooltip='Inter-stage Pressure Gauge' />
                            </g>
                          );
                        })}

                        {/* 3. Last stage concentrate to Reject Header */}
                        {(() => {
                          const cx_last = stg_cx(passX, numStages - 1);
                          const cy_last = stg_cy(numStages - 1);
                          const concTailX = cx_last + STAGE_W/2 + 20;
                          return (
                            <g>
                              <FlowPath pts={[[cx_last + STAGE_W/2, cy_last], [concTailX, cy_last], [concTailX, REJECT_Y]]} color={C.reject} />
                              <circle cx={concTailX} cy={REJECT_Y} r='3' fill={C.reject} />
                              <InlineBadge x={concTailX} y={(cy_last + REJECT_Y)/2} label={labelReject} color={C.reject} tooltip={`Pass ${passIdx + 1} Reject Stream`} />
                            </g>
                          );
                        })()}

                        {/* 4. Permeate drops */}
                        {Array.from({ length: numStages }).map((_, i) => {
                          const cx = stg_cx(passX, i);
                          const cy = stg_cy(i);
                          return (
                            <g key={`perm-${i}`}>
                              <FlowPath pts={[[cx, cy + STAGE_H/2], [cx, PERIM_Y]]} color={C.permeate} />
                            </g>
                          );
                        })}

                        {/* 5. Permeate Header & Routing */}
                        {(() => {
                          const first_cx = stg_cx(passX, 0);
                          
                          if (!isLastPass) {
                            const next_passX = passStarts[passIdx + 1];
                            return (
                              <g>
                                <FlowPath pts={[[first_cx, PERIM_Y], [next_passX - 30, PERIM_Y], [next_passX - 30, FLOW_Y]]} color={C.permeate} />
                                <InlineBadge x={(first_cx + next_passX - 30)/2} y={PERIM_Y} label={labelPerm} color={C.permeate} tooltip={`Pass ${passIdx + 1} Permeate to Pass ${passIdx + 2}`} />
                              </g>
                            );
                          } else {
                            const productX = passX + passW(numStages);
                            return (
                              <g>
                                <FlowPath pts={[[first_cx, PERIM_Y], [productX, PERIM_Y]]} color={C.permeate} markerEnd='url(#arr-perm)' />
                                <InlineBadge x={(first_cx + productX)/2} y={PERIM_Y} label={labelPerm} color={C.permeate} tooltip={`Final Permeate Stream`} />
                                <DataBadge x={productX + 60} y={PERIM_Y - 26} title='Product Water Output' val1={`${permeateFlow.toFixed(1)} m³/h`} val2={`${permeateTDS.toFixed(0)} ppm`} color={C.permeate} tooltip='Final High Quality Permeate' />
                                <Sensor x={productX + 60} y={PERIM_Y} label='TDS' tooltip={`Conductivity Sensor\n${permeateTDS.toFixed(0)} ppm`} />
                              </g>
                            );
                          }
                        })()}

                        {/* 6. Stage Blocks */}
                        {pass.stages.map((stage, i) => (
                          <VesselBlock key={`stg-${i}`} cx={stg_cx(passX, i)} cy={stg_cy(i)} label={`Primary RO Stage ${i + 1}`} stage={stage} />
                        ))}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
