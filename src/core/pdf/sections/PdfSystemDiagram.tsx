import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Svg,
  Rect,
  Line,
  Polygon,
  Path,
  Circle,
  G,
} from '@react-pdf/renderer';
import { PdfPageTemplate } from '../templates/PdfPageTemplate';
import {
  PdfSectionHeader,
  PdfSubsection,
} from '../components/PdfSectionHeader';
import { PDF_COLORS, PDF_FONTS, PDF_SIZES } from '../constants/pdf.constants';
import type { FullEngineeringReport } from '@/core/reporting/models/report.models';

const s = StyleSheet.create({
  diagramWrapper: {
    border: `1pt solid ${PDF_COLORS.border}`,
    borderRadius: 4,
    backgroundColor: PDF_COLORS.bgAlt,
    padding: 12,
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.borderLight,
    borderTopStyle: 'solid',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendLine: {
    width: 20,
    height: 2,
  },
  legendLabel: {
    fontSize: PDF_SIZES.tiny,
    fontFamily: PDF_FONTS.sans,
    color: PDF_COLORS.textSecondary,
  },
  tagLabel: {
    fontSize: PDF_SIZES.label,
    fontFamily: PDF_FONTS.monoBold,
    color: PDF_COLORS.textMuted,
    textAlign: 'center',
    marginTop: 3,
  },
  flowDataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  flowDataCard: {
    width: '31%', // Fits 3 across or 2 wide depending on container
    minWidth: 100,
    flexGrow: 1,
    padding: 8,
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  flowDataLabel: {
    fontSize: PDF_SIZES.label,
    fontFamily: PDF_FONTS.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  flowDataValue: {
    fontSize: PDF_SIZES.h4,
    fontFamily: PDF_FONTS.monoBold,
  },
  flowDataUnit: {
    fontSize: PDF_SIZES.tiny,
    fontFamily: PDF_FONTS.mono,
    color: PDF_COLORS.textMuted,
  },
});

// ─── Block flow diagram (SVG primitives) ─────────────────────────────────────

interface BfdProps {
  feedFlowM3h: number;
  permeateFlowM3h: number;
  concentrateFlowM3h: number;
  recovery: number;
  feedPressureBar: number;
  feedTDS: number;
  permeateTDS: number;
  stages: { vessels: number; elements: number }[];
}

function BlockFlowDiagram({
  feedFlowM3h,
  permeateFlowM3h,
  concentrateFlowM3h,
  recovery,
  feedPressureBar,
  feedTDS,
  permeateTDS,
  stages,
}: BfdProps) {
  // Layout constants (SVG coordinate space: 520 × 200)
  const W = 520;
  const H = 200;

  const feedX = 10;
  const pumpX = 70;
  const pumpCX = pumpX + 22;
  const pumpCY = 100;
  const roStartX = 140;
  const roEndX = 380;
  const rejectX = 440;
  const permY = 155;

  const stageCount = stages.length || 1;
  const stageW = (roEndX - roStartX) / stageCount - 6;

  return (
    <Svg width='100%' height='200' viewBox={`0 0 ${W} ${H}`}>
      {/* ── Background ── */}
      <Rect x='0' y='0' width={W} height={H} fill={PDF_COLORS.bgAlt} />

      {/* ── Feed line (left → pump) ── */}
      <Line
        x1={feedX}
        y1={pumpCY}
        x2={pumpX}
        y2={pumpCY}
        stroke={PDF_COLORS.feed}
        strokeWidth='2.5'
      />
      {/* Feed label */}
      <Rect
        x={feedX}
        y={pumpCY - 24}
        width={54}
        height={16}
        rx='2'
        fill={PDF_COLORS.feed}
        opacity='0.12'
      />

      {/* ── HP Pump circle ── */}
      <Circle
        cx={pumpCX}
        cy={pumpCY}
        r={18}
        fill='white'
        stroke={PDF_COLORS.primaryDark}
        strokeWidth='2'
      />
      <Polygon
        points={`${pumpCX - 8},${pumpCY + 10} ${pumpCX - 8},${pumpCY - 10} ${pumpCX + 10},${pumpCY}`}
        fill={PDF_COLORS.primaryDark}
      />

      {/* Pump tag */}
      <Rect
        x={pumpCX - 14}
        y={pumpCY + 22}
        width={28}
        height={10}
        rx='1'
        fill={PDF_COLORS.bgMuted}
      />

      {/* ── Feed line (pump → first stage) ── */}
      <Line
        x1={pumpCX + 18}
        y1={pumpCY}
        x2={roStartX}
        y2={pumpCY}
        stroke={PDF_COLORS.primaryDark}
        strokeWidth='2.5'
      />

      {/* ── RO Stage blocks ── */}
      {Array.from({ length: stageCount }).map((_, si) => {
        const stX = roStartX + si * ((roEndX - roStartX) / stageCount) + 3;
        const stY = 65;
        const stH = 70;
        const midY = stY + stH / 2;

        return (
          <G key={si}>
            {/* Stage vessel block */}
            <Rect
              x={stX}
              y={stY}
              width={stageW}
              height={stH}
              rx='4'
              fill={PDF_COLORS.primaryLight}
              stroke={PDF_COLORS.primary}
              strokeWidth='1.5'
            />
            {/* Horizontal flow line through stage */}
            <Line
              x1={stX}
              y1={midY}
              x2={stX + stageW}
              y2={midY}
              stroke={PDF_COLORS.primary}
              strokeWidth='1.5'
              strokeDasharray={si > 0 ? '4,3' : ''}
            />
            {/* Permeate drop line */}
            <Line
              x1={stX + stageW / 2}
              y1={stY + stH}
              x2={stX + stageW / 2}
              y2={permY}
              stroke={PDF_COLORS.permeate}
              strokeWidth='1.5'
              strokeDasharray='4,3'
            />
            {/* Stage number */}
            <Rect
              x={stX + stageW / 2 - 16}
              y={stY + 4}
              width={32}
              height={12}
              rx='2'
              fill={PDF_COLORS.primary}
            />
          </G>
        );
      })}

      {/* ── Permeate collector line ── */}
      <Line
        x1={roStartX + (roEndX - roStartX) / (2 * stageCount)}
        y1={permY}
        x2={roEndX - (roEndX - roStartX) / (2 * stageCount)}
        y2={permY}
        stroke={PDF_COLORS.permeate}
        strokeWidth='2'
        strokeDasharray='5,3'
      />
      {/* Permeate exit line */}
      <Line
        x1={(roStartX + roEndX) / 2}
        y1={permY}
        x2={(roStartX + roEndX) / 2}
        y2={H - 16}
        stroke={PDF_COLORS.permeate}
        strokeWidth='2'
        strokeDasharray='5,3'
      />

      {/* ── Reject line (last stage → right) ── */}
      <Line
        x1={roEndX}
        y1={pumpCY}
        x2={rejectX + 40}
        y2={pumpCY}
        stroke={PDF_COLORS.reject}
        strokeWidth='2.5'
        strokeDasharray='6,3'
      />
      {/* Reject arrowhead */}
      <Polygon
        points={`${rejectX + 38},${pumpCY - 5} ${rejectX + 38},${pumpCY + 5} ${rejectX + 48},${pumpCY}`}
        fill={PDF_COLORS.reject}
      />

      {/* ── Pressure instrumentation tag ── */}
      <Circle
        cx={roStartX + 16}
        cy={pumpCY - 26}
        r={12}
        fill='white'
        stroke={PDF_COLORS.primaryDark}
        strokeWidth='1.2'
      />

      {/* ── Conductivity sensor box ── */}
      <Rect
        x={(roStartX + roEndX) / 2 - 20}
        y={H - 40}
        width={40}
        height={16}
        rx='2'
        fill='white'
        stroke={PDF_COLORS.permeate}
        strokeWidth='1.2'
      />

      {/* ── Text labels ── */}
      {/* Feed */}
      {/* HP Pump */}
      {/* Stage labels */}
      {/* PERMEATE */}
      {/* CONCENTRATE */}
    </Svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  report: FullEngineeringReport;
  generatedAt: string;
}

export function PdfSystemDiagram({ report, generatedAt }: Props) {
  const ov = report.systemOverview;
  const stagesForDiagram = report.stages.map((s) => ({
    vessels: s.vesselCount,
    elements: s.elementCount,
  }));

  return (
    <PdfPageTemplate
      projectName={report.metadata.projectName}
      generatedAt={generatedAt}
      orientation='portrait'
    >
      <PdfSectionHeader
        number='SECTION VI'
        title='Process Flow Diagram'
        subtitle='Simplified block flow diagram — RO system topology, flow direction, and instrumentation'
        accentColor={PDF_COLORS.primary}
      />

      <PdfSubsection title='RO System Block Flow Diagram' marginTop={0} />

      <View style={s.diagramWrapper}>
        <BlockFlowDiagram
          feedFlowM3h={ov.systemFeedM3h}
          permeateFlowM3h={ov.systemPermeateM3h}
          concentrateFlowM3h={ov.systemConcentrateM3h}
          recovery={ov.roRecoveryPercent}
          feedPressureBar={report.passes[0]?.feedPressureBar ?? 0}
          feedTDS={ov.feedTDSMgL}
          permeateTDS={ov.permeateTDSMgL}
          stages={stagesForDiagram}
        />

        {/* Legend */}
        <View style={s.legendRow}>
          <View style={s.legendItem}>
            <View
              style={[s.legendLine, { backgroundColor: PDF_COLORS.feed }]}
            />
            <Text style={s.legendLabel}>Feed Water</Text>
          </View>
          <View style={s.legendItem}>
            <View
              style={[
                s.legendLine,
                { backgroundColor: PDF_COLORS.permeate, borderStyle: 'dashed' },
              ]}
            />
            <Text style={s.legendLabel}>Permeate (Product)</Text>
          </View>
          <View style={s.legendItem}>
            <View
              style={[s.legendLine, { backgroundColor: PDF_COLORS.reject }]}
            />
            <Text style={s.legendLabel}>Concentrate (Reject)</Text>
          </View>
          <View style={s.legendItem}>
            <View
              style={[
                s.legendLine,
                { backgroundColor: PDF_COLORS.primaryDark },
              ]}
            />
            <Text style={s.legendLabel}>High-Pressure Line</Text>
          </View>
        </View>
      </View>

      {/* Flow data summary below diagram */}
      <PdfSubsection title='Stream Flow Summary' />
      <View style={s.flowDataRow}>
        {/* Feed */}
        <View
          style={[
            s.flowDataCard,
            { borderColor: PDF_COLORS.feed, backgroundColor: '#F8FAFC' },
          ]}
        >
          <Text style={[s.flowDataLabel, { color: PDF_COLORS.feed }]}>
            Feed Water
          </Text>
          <Text style={[s.flowDataValue, { color: PDF_COLORS.textPrimary }]}>
            {ov.systemFeedM3h.toFixed(2)}
          </Text>
          <Text style={s.flowDataUnit}>m³/h</Text>
          <Text style={[s.flowDataUnit, { marginTop: 4 }]}>
            TDS: {Math.round(ov.feedTDSMgL).toLocaleString()} mg/L
          </Text>
        </View>
        {/* HP Pump */}
        <View
          style={[
            s.flowDataCard,
            {
              borderColor: PDF_COLORS.primaryDark,
              backgroundColor: PDF_COLORS.bgSection,
            },
          ]}
        >
          <Text style={[s.flowDataLabel, { color: PDF_COLORS.primaryDark }]}>
            HP Pump
          </Text>
          <Text style={[s.flowDataValue, { color: PDF_COLORS.primaryDark }]}>
            {report.passes[0]?.feedPressureBar.toFixed(1) ?? '—'}
          </Text>
          <Text style={s.flowDataUnit}>bar discharge</Text>
          <Text style={[s.flowDataUnit, { marginTop: 4 }]}>P-101 / HP-01</Text>
        </View>
        {/* RO Stages */}
        <View
          style={[
            s.flowDataCard,
            {
              borderColor: PDF_COLORS.primary,
              backgroundColor: PDF_COLORS.primaryLight,
            },
          ]}
        >
          <Text style={[s.flowDataLabel, { color: PDF_COLORS.primary }]}>
            RO Array
          </Text>
          <Text style={[s.flowDataValue, { color: PDF_COLORS.primaryDark }]}>
            {report.stages.length} Stage{report.stages.length !== 1 ? 's' : ''}
          </Text>
          <Text style={s.flowDataUnit}>
            {report.elements.length} elements total
          </Text>
          <Text style={[s.flowDataUnit, { marginTop: 4 }]}>
            {report.stages
              .map(
                (s, i) => `S${i + 1}: ${s.vesselCount}×${s.elementsPerVessel}`,
              )
              .join(' / ')}
          </Text>
        </View>
        {/* Permeate */}
        <View
          style={[
            s.flowDataCard,
            { borderColor: PDF_COLORS.permeate, backgroundColor: '#EFF6FF' },
          ]}
        >
          <Text style={[s.flowDataLabel, { color: PDF_COLORS.permeate }]}>
            Permeate
          </Text>
          <Text style={[s.flowDataValue, { color: PDF_COLORS.permeate }]}>
            {ov.systemPermeateM3h.toFixed(2)}
          </Text>
          <Text style={s.flowDataUnit}>m³/h</Text>
          <Text style={[s.flowDataUnit, { marginTop: 4 }]}>
            TDS: {Math.round(ov.permeateTDSMgL).toLocaleString()} mg/L
          </Text>
        </View>
        {/* Concentrate */}
        <View
          style={[
            s.flowDataCard,
            { borderColor: PDF_COLORS.reject, backgroundColor: '#FFF7ED' },
          ]}
        >
          <Text style={[s.flowDataLabel, { color: PDF_COLORS.reject }]}>
            Concentrate
          </Text>
          <Text style={[s.flowDataValue, { color: PDF_COLORS.reject }]}>
            {ov.systemConcentrateM3h.toFixed(2)}
          </Text>
          <Text style={s.flowDataUnit}>m³/h</Text>
          <Text style={[s.flowDataUnit, { marginTop: 4 }]}>
            Recovery: {ov.roRecoveryPercent.toFixed(1)}%
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 12,
          padding: 8,
          backgroundColor: PDF_COLORS.bgMuted,
          borderLeftWidth: 2,
          borderLeftColor: PDF_COLORS.border,
          borderLeftStyle: 'solid',
        }}
      >
        <Text
          style={{
            fontSize: PDF_SIZES.tiny,
            fontFamily: PDF_FONTS.sansOblique,
            color: PDF_COLORS.textMuted,
            lineHeight: 1.4,
          }}
        >
          This is a simplified block flow diagram for reference. For full
          P&amp;ID-grade process flow diagrams with instrumentation loops,
          control valves, and detailed piping, refer to the SOL9X web
          application interactive PFD. Instrumentation tags shown are for
          identification only (P-101: HP Pump, PI-101: Pressure Indicator,
          COND-201: Conductivity Analyzer).
        </Text>
      </View>
    </PdfPageTemplate>
  );
}
