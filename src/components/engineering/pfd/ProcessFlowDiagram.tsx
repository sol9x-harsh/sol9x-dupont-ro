// 'use client';

// interface Props {
//   feedFlow?: number;
//   permeateFlow?: number;
//   rejectFlow?: number;
//   recovery?: number;
//   pumpPressure?: number;
//   feedTDS?: number;
//   permeateTDS?: number;
//   rejectTDS?: number;
//   stages?: { vessels: number; elements: number }[];
//   boosterPressures?: number[];
//   // Legacy props
//   stage1?: { vessels: number; elements: number };
//   stage2?: { vessels: number; elements: number };
//   stage3?: { vessels: number; elements: number };
// }

// const FlowBadge = ({
//   x,
//   y,
//   num,
//   label,
// }: {
//   x: number;
//   y: number;
//   num: string | number;
//   label?: string;
// }) => {
//   const tooltipText = label ? `${num}: ${label}` : '';
//   // Approximate width based on character count
//   const tooltipWidth = tooltipText.length * 6.5 + 16;

//   return (
//     <g transform={`translate(${x}, ${y})`} className='group'>
//       <rect
//         x='-10'
//         y='-8'
//         width='20'
//         height='16'
//         fill='hsl(var(--card))'
//         stroke='hsl(var(--foreground))'
//         strokeWidth='1'
//         rx='2'
//       />
//       <text
//         x='0'
//         y='3'
//         textAnchor='middle'
//         fontSize='9'
//         fontWeight='bold'
//         fontFamily='JetBrains Mono'
//         fill='hsl(var(--foreground))'
//       >
//         {num}
//       </text>

//       {/* SVG Tooltip */}
//       {label && (
//         <g className='opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
//           {/* Tooltip Background */}
//           <rect
//             x={-(tooltipWidth / 2)}
//             y='-32'
//             width={tooltipWidth}
//             height='22'
//             rx='4'
//             fill='#1e293b'
//             className='drop-shadow-md'
//           />
//           {/* Tooltip Pointer */}
//           <path d='M-5 -10 L0 -5 L5 -10 Z' fill='#1e293b' />
//           {/* Tooltip Text */}
//           <text
//             x='0'
//             y='-16'
//             textAnchor='middle'
//             fontSize='11'
//             fontWeight='500'
//             fill='#f8fafc'
//             fontFamily='Inter, sans-serif'
//           >
//             {tooltipText}
//           </text>
//         </g>
//       )}
//     </g>
//   );
// };

// export function ProcessFlowDiagram({
//   feedFlow = 120,
//   permeateFlow = 90,
//   rejectFlow = 30,
//   recovery = 75,
//   pumpPressure = 14.2,
//   feedTDS = 2400,
//   permeateTDS = 42,
//   rejectTDS = 4850,
//   stage1,
//   stage2,
//   stage3,
//   stages: propStages,
//   boosterPressures = [],
// }: Props) {
//   // Use propStages if provided, otherwise fallback to legacy individual props, otherwise default 1 stage
//   const activeStages =
//     propStages ||
//     ([stage1, stage2, stage3].filter(Boolean) as {
//       vessels: number;
//       elements: number;
//     }[]);
//   if (activeStages.length === 0) activeStages.push({ vessels: 8, elements: 7 });

//   const STAGE_WIDTH = 240;
//   const STAGE_GAP = 80;
//   const START_X = 420;
//   const endX = START_X + activeStages.length * (STAGE_WIDTH + STAGE_GAP);
//   const viewBoxWidth = Math.max(1280, endX + 360);

//   return (
//     <div className='relative w-full rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-elegant transition-shadow duration-300'>
//       {/* subtle grid bg */}
//       <div className='absolute inset-0 grid-bg opacity-30 pointer-events-none' />
//       {/* Top accent */}
//       <div className='absolute inset-x-0 top-0 h-[2px] bg-linear-to-r from-primary/40 via-primary-glow/60 to-permeate/40' />

//       <div className='relative p-2'>
//         <svg
//           viewBox={`0 0 ${viewBoxWidth} 420`}
//           className='w-full h-auto'
//           style={{ maxHeight: 480 }}
//         >
//           <defs>
//             <marker
//               id='arrow'
//               viewBox='0 0 10 10'
//               refX='9'
//               refY='5'
//               markerWidth='6'
//               markerHeight='6'
//               orient='auto-start-reverse'
//             >
//               <path d='M0,0 L10,5 L0,10 z' fill='hsl(var(--feed))' />
//             </marker>
//             <marker
//               id='arrow-permeate'
//               viewBox='0 0 10 10'
//               refX='9'
//               refY='5'
//               markerWidth='6'
//               markerHeight='6'
//               orient='auto-start-reverse'
//             >
//               <path d='M0,0 L10,5 L0,10 z' fill='hsl(var(--permeate))' />
//             </marker>
//             <marker
//               id='arrow-conc'
//               viewBox='0 0 10 10'
//               refX='9'
//               refY='5'
//               markerWidth='6'
//               markerHeight='6'
//               orient='auto-start-reverse'
//             >
//               <path d='M0,0 L10,5 L0,10 z' fill='hsl(var(--concentrate))' />
//             </marker>
//             {/* Subtle shadow filter */}
//             <filter id='node-shadow' x='-4%' y='-4%' width='108%' height='108%'>
//               <feDropShadow
//                 dx='0'
//                 dy='2'
//                 stdDeviation='4'
//                 floodColor='hsl(215 25% 27%)'
//                 floodOpacity='0.06'
//               />
//             </filter>

//             {/* UI Gradients */}
//             <linearGradient id='feed-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
//               <stop offset='0%' stopColor='hsl(var(--card))' />
//               <stop offset='100%' stopColor='hsl(var(--primary-soft)/0.4)' />
//             </linearGradient>
//             <linearGradient
//               id='permeate-grad'
//               x1='0%'
//               y1='0%'
//               x2='100%'
//               y2='100%'
//             >
//               <stop offset='0%' stopColor='hsl(var(--card))' />
//               <stop offset='100%' stopColor='hsl(var(--permeate-soft))' />
//             </linearGradient>
//             <linearGradient
//               id='reject-grad'
//               x1='0%'
//               y1='0%'
//               x2='100%'
//               y2='100%'
//             >
//               <stop offset='0%' stopColor='hsl(var(--card))' />
//               <stop offset='100%' stopColor='hsl(var(--concentrate-soft))' />
//             </linearGradient>
//             <linearGradient id='stage-grad' x1='0%' y1='0%' x2='0%' y2='100%'>
//               <stop offset='0%' stopColor='hsl(var(--primary-soft))' />
//               <stop offset='100%' stopColor='hsl(var(--card))' />
//             </linearGradient>
//             <linearGradient id='vessel-grad' x1='0%' y1='0%' x2='0%' y2='100%'>
//               <stop offset='0%' stopColor='hsl(var(--primary-soft))' />
//               <stop offset='40%' stopColor='hsl(var(--card))' />
//               <stop offset='100%' stopColor='hsl(var(--primary-soft))' />
//             </linearGradient>
//             <linearGradient id='pump-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
//               <stop offset='0%' stopColor='hsl(var(--primary-soft))' />
//               <stop offset='100%' stopColor='hsl(var(--card))' />
//             </linearGradient>
//           </defs>

//           {/* FEED node */}
//           <g transform='translate(20,160)' filter='url(#node-shadow)'>
//             <rect
//               width='140'
//               height='80'
//               rx='12'
//               fill='url(#feed-grad)'
//               stroke='hsl(var(--border))'
//               strokeWidth='1'
//             />
//             {/* Glass highlight */}
//             <rect
//               width='138'
//               height='78'
//               x='1'
//               y='1'
//               rx='11'
//               fill='none'
//               stroke='white'
//               strokeOpacity='0.4'
//               className='pointer-events-none'
//             />
//             <rect
//               width='140'
//               height='3'
//               rx='1.5'
//               y='0'
//               fill='hsl(var(--feed))'
//               opacity='0.6'
//             />
//             <text
//               x='70'
//               y='28'
//               textAnchor='middle'
//               fontSize='9'
//               fill='hsl(var(--muted-foreground))'
//               letterSpacing='2'
//               fontWeight='700'
//             >
//               FEED
//             </text>
//             <text
//               x='70'
//               y='48'
//               textAnchor='middle'
//               fontSize='15'
//               fill='hsl(var(--foreground))'
//               fontWeight='600'
//               fontFamily='Open Sans'
//             >
//               Raw Water
//             </text>
//             <text
//               x='70'
//               y='68'
//               textAnchor='middle'
//               fontSize='11'
//               fill='hsl(var(--muted-foreground))'
//               fontFamily='JetBrains Mono'
//             >
//               {feedFlow.toFixed(1)} m³/h
//             </text>
//           </g>

//           {/* FLOW COLOR LEGEND */}
//           <g transform='translate(20, 310)'>
//             <rect
//               width='150'
//               height='86'
//               rx='8'
//               fill='hsl(var(--card))'
//               stroke='hsl(var(--border))'
//               strokeWidth='1'
//               opacity='0.8'
//             />
//             <text
//               x='15'
//               y='22'
//               fontSize='9'
//               fill='hsl(var(--foreground))'
//               fontWeight='700'
//               letterSpacing='1'
//             >
//               FLOW LEGEND
//             </text>

//             {/* Feed line */}
//             <line
//               x1='15'
//               y1='40'
//               x2='40'
//               y2='40'
//               stroke='hsl(var(--feed))'
//               strokeWidth='2'
//             />
//             <text
//               x='50'
//               y='43'
//               fontSize='10'
//               fill='hsl(var(--muted-foreground))'
//             >
//               Feed Water
//             </text>

//             {/* Permeate line */}
//             <line
//               x1='15'
//               y1='58'
//               x2='40'
//               y2='58'
//               stroke='hsl(var(--permeate))'
//               strokeWidth='2'
//               strokeDasharray='4 4'
//             />
//             <text
//               x='50'
//               y='61'
//               fontSize='10'
//               fill='hsl(var(--muted-foreground))'
//             >
//               Permeate Flow
//             </text>

//             {/* Concentrate line */}
//             <line
//               x1='15'
//               y1='76'
//               x2='40'
//               y2='76'
//               stroke='hsl(var(--concentrate))'
//               strokeWidth='2'
//               strokeDasharray='4 4'
//             />
//             <text
//               x='50'
//               y='79'
//               fontSize='10'
//               fill='hsl(var(--muted-foreground))'
//             >
//               Concentrate Flow
//             </text>
//           </g>

//           {/* feed → pump */}
//           <line
//             x1='160'
//             y1='200'
//             x2='240'
//             y2='200'
//             stroke='hsl(var(--feed))'
//             strokeWidth='1.5'
//             className='flow-line'
//             markerEnd='url(#arrow)'
//           />
//           <FlowBadge x={170} y={200} num='1' label='Feed' />
//           <FlowBadge x={210} y={200} num='3' label='HP Pump Inlet' />

//           {/* Bypass Line (13) */}
//           <path
//             d={`M 180 200 L 180 30 L ${endX + 90} 30 L ${endX + 90} 155`}
//             fill='none'
//             stroke='hsl(var(--feed))'
//             strokeWidth='1.5'
//             className='flow-line'
//             opacity='0.6'
//             markerEnd='url(#arrow)'
//           />
//           <FlowBadge
//             x={(180 + endX + 90) / 2}
//             y={30}
//             num='13'
//             label='Pass 1 Bypass'
//           />

//           {/* HP Pump */}
//           <g transform='translate(240,160)' filter='url(#node-shadow)'>
//             <circle
//               cx='40'
//               cy='40'
//               r='38'
//               fill='url(#pump-grad)'
//               stroke='hsl(var(--primary))'
//               strokeWidth='1.5'
//             />
//             {/* Glass highlight */}
//             <circle
//               cx='40'
//               cy='40'
//               r='37'
//               fill='none'
//               stroke='white'
//               strokeOpacity='0.5'
//               className='pointer-events-none'
//             />

//             {/* Correct centrifugal pump P&ID Impeller: Triangle pointing in flow direction (right) */}
//             <path
//               d='M 28 26 L 28 54 L 52 40 Z'
//               fill='hsl(var(--primary)/0.1)'
//               stroke='hsl(var(--primary))'
//               strokeWidth='2'
//               strokeLinejoin='round'
//             />
//             {/* small inner circle for shaft */}
//             <circle
//               cx='36'
//               cy='40'
//               r='2.5'
//               fill='hsl(var(--primary))'
//               opacity='0.9'
//             />
//             <text
//               x='40'
//               y='105'
//               textAnchor='middle'
//               fontSize='11'
//               fill='hsl(var(--foreground))'
//               fontWeight='600'
//               fontFamily='Open Sans'
//             >
//               HP Pump
//             </text>
//             <text
//               x='40'
//               y='120'
//               textAnchor='middle'
//               fontSize='10'
//               fill='hsl(var(--concentrate))'
//               fontFamily='JetBrains Mono'
//             >
//               {pumpPressure.toFixed(1)} bar
//             </text>
//           </g>

//           {/* pump → stage 1 */}
//           <line
//             x1='320'
//             y1='200'
//             x2='428'
//             y2='200'
//             stroke='hsl(var(--feed))'
//             strokeWidth='1.5'
//             className='flow-line'
//             markerEnd='url(#arrow)'
//           />
//           <FlowBadge x={370} y={200} num='5' label='Net Feed' />

//           {/* DYNAMIC STAGES GENERATION */}
//           {activeStages.map((stage, idx) => {
//             const x = START_X + idx * (STAGE_WIDTH + STAGE_GAP);
//             const y = 120 + (idx % 2 === 0 ? 0 : 20); // alternate heights slightly
//             const isLast = idx === activeStages.length - 1;

//             // The number of visual rows to draw (max 3 for visual cleanliness)
//             const visualRows = Math.min(
//               3,
//               Math.max(1, Math.ceil(stage.vessels / 5)),
//             );

//             return (
//               <g key={`stage-${idx}`}>
//                 {/* FLOW FROM PREVIOUS TO THIS STAGE (WITH BOOSTER) */}
//                 {idx !== 0 && (
//                   <g>
//                     {/* Line from previous concentrate to Booster Inlet */}
//                     <line
//                       x1={x - STAGE_GAP}
//                       y1='200'
//                       x2={x - STAGE_GAP / 2 - 25}
//                       y2='200'
//                       stroke='hsl(var(--concentrate))'
//                       strokeWidth='1.5'
//                       className='flow-line'
//                     />

//                     {/* Booster Pump Symbol */}
//                     <g
//                       transform={`translate(${x - STAGE_GAP / 2 - 25}, 175)`}
//                       filter='url(#node-shadow)'
//                     >
//                       <circle
//                         cx='25'
//                         cy='25'
//                         r='22'
//                         fill='url(#pump-grad)'
//                         stroke='hsl(var(--primary))'
//                         strokeWidth='1'
//                       />
//                       <path
//                         d='M 18 16 L 18 34 L 34 25 Z'
//                         fill='hsl(var(--primary)/0.1)'
//                         stroke='hsl(var(--primary))'
//                         strokeWidth='1.5'
//                         strokeLinejoin='round'
//                       />
//                       <text
//                         x='25'
//                         y='62'
//                         textAnchor='middle'
//                         fontSize='9'
//                         fill='hsl(var(--foreground))'
//                         fontWeight='600'
//                       >
//                         Booster
//                       </text>
//                       <text
//                         x='25'
//                         y='72'
//                         textAnchor='middle'
//                         fontSize='8'
//                         fill='hsl(var(--concentrate))'
//                         fontFamily='JetBrains Mono'
//                       >
//                         +{boosterPressures[idx - 1] || 2.5} bar
//                       </text>
//                     </g>

//                     {/* Line from Booster Outlet to Current Stage Feed */}
//                     <line
//                       x1={x - STAGE_GAP / 2 + 25}
//                       y1='200'
//                       x2={x + 8}
//                       y2='200'
//                       stroke='hsl(var(--feed))'
//                       strokeWidth='1.5'
//                       className='flow-line'
//                       markerEnd='url(#arrow)'
//                     />

//                     <FlowBadge
//                       x={x - STAGE_GAP / 2 - 40}
//                       y={200}
//                       num={6 + (idx - 1) * 2}
//                       label='Booster Inlet'
//                     />
//                     <FlowBadge
//                       x={x - STAGE_GAP / 2 + 40}
//                       y={200}
//                       num={7 + (idx - 1) * 2}
//                       label='Booster Outlet'
//                     />
//                   </g>
//                 )}

//                 {/* STAGE BLOCK */}
//                 <g
//                   transform={`translate(${x},${y})`}
//                   filter='url(#node-shadow)'
//                 >
//                   <rect
//                     width={STAGE_WIDTH}
//                     height={100 + visualRows * 20}
//                     rx='14'
//                     fill='url(#stage-grad)'
//                     stroke='hsl(var(--primary)/0.35)'
//                     strokeWidth='1.2'
//                   />
//                   {/* Glass highlight */}
//                   <rect
//                     width={STAGE_WIDTH - 2}
//                     height={98 + visualRows * 20}
//                     x='1'
//                     y='1'
//                     rx='13'
//                     fill='none'
//                     stroke='white'
//                     strokeOpacity='0.5'
//                     className='pointer-events-none'
//                   />

//                   <text
//                     x='20'
//                     y='28'
//                     fontSize='9'
//                     fill='hsl(var(--primary))'
//                     letterSpacing='2'
//                     fontWeight='700'
//                   >
//                     STAGE {idx + 1}
//                   </text>
//                   <text
//                     x='20'
//                     y='52'
//                     fontSize='14'
//                     fill='hsl(var(--foreground))'
//                     fontWeight='600'
//                     fontFamily='Open Sans'
//                   >
//                     {stage.vessels} Vessels · {stage.elements} Elements
//                   </text>

//                   {/* MANIFOLDS */}
//                   {/* Feed Manifold */}
//                   <line
//                     x1='0'
//                     y1={200 - y}
//                     x2='10'
//                     y2={200 - y}
//                     stroke='hsl(var(--feed))'
//                     strokeWidth='2'
//                   />
//                   <line
//                     x1='10'
//                     y1={Math.min(200 - y, 78)}
//                     x2='10'
//                     y2={Math.max(200 - y, 70 + (visualRows - 1) * 22 + 8)}
//                     stroke='hsl(var(--feed))'
//                     strokeWidth='2'
//                     strokeLinecap='round'
//                   />

//                   {/* Concentrate Manifold */}
//                   <line
//                     x1={STAGE_WIDTH - 10}
//                     y1={Math.min(200 - y, 78)}
//                     x2={STAGE_WIDTH - 10}
//                     y2={Math.max(200 - y, 70 + (visualRows - 1) * 22 + 8)}
//                     stroke='hsl(var(--concentrate))'
//                     strokeWidth='2'
//                     strokeLinecap='round'
//                   />
//                   <line
//                     x1={STAGE_WIDTH - 10}
//                     y1={200 - y}
//                     x2={STAGE_WIDTH}
//                     y2={200 - y}
//                     stroke='hsl(var(--concentrate))'
//                     strokeWidth='2'
//                   />

//                   {/* Permeate Header (Center Vertical) */}
//                   <line
//                     x1={STAGE_WIDTH / 2}
//                     y1='0'
//                     x2={STAGE_WIDTH / 2}
//                     y2='15'
//                     stroke='hsl(var(--permeate))'
//                     strokeWidth='2'
//                     strokeDasharray='4 4'
//                   />
//                   <line
//                     x1={STAGE_WIDTH / 2}
//                     y1='65'
//                     x2={STAGE_WIDTH / 2}
//                     y2={70 + (visualRows - 1) * 22 + 8}
//                     stroke='hsl(var(--permeate))'
//                     strokeWidth='2'
//                     strokeDasharray='4 4'
//                   />

//                   {/* VESSEL ROWS */}
//                   {[...Array(visualRows)].map((_, r) => (
//                     <g key={r} transform={`translate(20, ${70 + r * 22})`}>
//                       {/* Connection to Feed Manifold */}
//                       <line
//                         x1='-10'
//                         y1='8'
//                         x2='0'
//                         y2='8'
//                         stroke='hsl(var(--feed))'
//                         strokeWidth='1.5'
//                       />
//                       {/* Connection to Concentrate Manifold */}
//                       <line
//                         x1={STAGE_WIDTH - 40}
//                         y1='8'
//                         x2={STAGE_WIDTH - 30}
//                         y2='8'
//                         stroke='hsl(var(--concentrate))'
//                         strokeWidth='1.5'
//                       />

//                       <rect
//                         width={STAGE_WIDTH - 40}
//                         height='16'
//                         rx='8'
//                         fill='url(#vessel-grad)'
//                         stroke='hsl(var(--primary)/0.4)'
//                         strokeWidth='1.2'
//                       />
//                       {/* Vessel glass reflection */}
//                       <rect
//                         width={STAGE_WIDTH - 42}
//                         height='14'
//                         x='1'
//                         y='1'
//                         rx='7'
//                         fill='none'
//                         stroke='white'
//                         strokeOpacity='0.6'
//                         className='pointer-events-none'
//                       />

//                       {/* P&ID RO Element Diagonal Line */}
//                       <line
//                         x1='8'
//                         y1='14'
//                         x2={STAGE_WIDTH - 48}
//                         y2='2'
//                         stroke='hsl(var(--primary)/0.3)'
//                         strokeWidth='1'
//                       />

//                       {/* Element Dividers */}
//                       {[...Array(Math.min(stage.elements, 8))].map((_, i) => (
//                         <line
//                           key={i}
//                           x1={20 + i * ((STAGE_WIDTH - 60) / stage.elements)}
//                           y1='2'
//                           x2={20 + i * ((STAGE_WIDTH - 60) / stage.elements)}
//                           y2='14'
//                           stroke='hsl(var(--primary)/0.25)'
//                           strokeWidth='0.8'
//                         />
//                       ))}
//                     </g>
//                   ))}
//                 </g>

//                 {/* PERMEATE COLLECTION LINE FOR THIS STAGE */}
//                 <path
//                   d={`M${x + STAGE_WIDTH / 2} ${y} L${x + STAGE_WIDTH / 2} ${60 + idx * 20} L${endX + 90} ${60 + idx * 20}${idx === 0 ? ` L${endX + 90} 155` : ''}`}
//                   fill='none'
//                   stroke='hsl(var(--permeate))'
//                   strokeWidth='1.2'
//                   strokeDasharray='4 4'
//                   className='dotted-line'
//                   markerEnd={idx === 0 ? 'url(#arrow-permeate)' : ''}
//                 />

//                 {/* FLOW OUT OF THIS STAGE (TO NEXT OR TO FINAL CONCENTRATE) */}
//                 {isLast && (
//                   <g>
//                     <path
//                       d={`M${x + STAGE_WIDTH} 200 L${endX - 20} 200 L${endX - 20} 360 L${endX + 20} 360`}
//                       fill='none'
//                       stroke='hsl(var(--concentrate))'
//                       strokeWidth='1.3'
//                       strokeDasharray='4 4'
//                       className='dotted-line'
//                       markerEnd='url(#arrow-conc)'
//                     />

//                     {/* Concentrate Control Valve (P&ID bowtie symbol) */}
//                     <g transform={`translate(${endX - 50}, 200)`}>
//                       <path
//                         d='M-6 -5 L6 5 L6 -5 L-6 5 Z'
//                         fill='hsl(var(--card))'
//                         stroke='hsl(var(--concentrate))'
//                         strokeWidth='1.5'
//                         strokeLinejoin='round'
//                       />
//                       <line
//                         x1='0'
//                         y1='-5'
//                         x2='0'
//                         y2='-9'
//                         stroke='hsl(var(--concentrate))'
//                         strokeWidth='1.5'
//                       />
//                       <line
//                         x1='-3'
//                         y1='-9'
//                         x2='3'
//                         y2='-9'
//                         stroke='hsl(var(--concentrate))'
//                         strokeWidth='1.5'
//                       />
//                     </g>

//                     <FlowBadge
//                       x={endX - 20}
//                       y={280}
//                       num='15'
//                       label='Concentrate'
//                     />
//                   </g>
//                 )}
//               </g>
//             );
//           })}

//           {/* REMOVED FLOATING TEXTS FOR CLEANER UI */}
//           {/* PRODUCT PERMEATE LINE END BADGE */}
//           <FlowBadge x={endX + 90} y={140} num='14' label='Permeate' />

//           {/* PERMEATE node */}
//           <g
//             transform={`translate(${endX + 20},160)`}
//             filter='url(#node-shadow)'
//           >
//             <rect
//               width='140'
//               height='80'
//               rx='12'
//               fill='url(#permeate-grad)'
//               stroke='hsl(var(--permeate)/0.35)'
//               strokeWidth='1.2'
//             />
//             <rect
//               width='138'
//               height='78'
//               x='1'
//               y='1'
//               rx='11'
//               fill='none'
//               stroke='white'
//               strokeOpacity='0.6'
//               className='pointer-events-none'
//             />
//             <rect
//               width='140'
//               height='3'
//               rx='1.5'
//               y='0'
//               fill='hsl(var(--permeate))'
//               opacity='0.5'
//             />
//             <text
//               x='70'
//               y='24'
//               textAnchor='middle'
//               fontSize='9'
//               fill='hsl(var(--permeate))'
//               letterSpacing='2'
//               fontWeight='700'
//             >
//               PERMEATE
//             </text>
//             <text
//               x='70'
//               y='46'
//               textAnchor='middle'
//               fontSize='15'
//               fill='hsl(var(--foreground))'
//               fontWeight='600'
//               fontFamily='Open Sans'
//             >
//               {permeateFlow.toFixed(1)} m³/h
//             </text>
//             <text
//               x='70'
//               y='65'
//               textAnchor='middle'
//               fontSize='10'
//               fill='hsl(var(--muted-foreground))'
//               fontFamily='JetBrains Mono'
//             >
//               TDS {permeateTDS} mg/L
//             </text>
//           </g>

//           {/* Exit flows */}
//           <line
//             x1={endX + 160}
//             y1='200'
//             x2={endX + 180}
//             y2='200'
//             stroke='hsl(var(--permeate))'
//             strokeWidth='1.5'
//             className='dotted-line'
//             markerEnd='url(#arrow-permeate)'
//           />
//           <FlowBadge x={endX + 170} y={200} num='20' label='Product' />
//           <text
//             x={endX + 135}
//             y='150'
//             fontSize='8'
//             fill='hsl(var(--permeate))'
//             fontWeight='700'
//           >
//             PRODUCT
//           </text>

//           <line
//             x1={endX + 160}
//             y1='360'
//             x2={endX + 180}
//             y2='360'
//             stroke='hsl(var(--concentrate))'
//             strokeWidth='1.5'
//             className='dotted-line'
//             markerEnd='url(#arrow-conc)'
//           />
//           <FlowBadge x={endX + 170} y={360} num='21' label='Waste' />
//           <text
//             x={endX + 135}
//             y='310'
//             fontSize='8'
//             fill='hsl(var(--concentrate))'
//             fontWeight='700'
//           >
//             WASTE
//           </text>

//           {/* REJECT node */}
//           <g
//             transform={`translate(${endX + 20},320)`}
//             filter='url(#node-shadow)'
//           >
//             <rect
//               width='140'
//               height='80'
//               rx='12'
//               fill='url(#reject-grad)'
//               stroke='hsl(var(--concentrate)/0.35)'
//               strokeWidth='1.2'
//             />
//             <rect
//               width='138'
//               height='78'
//               x='1'
//               y='1'
//               rx='11'
//               fill='none'
//               stroke='white'
//               strokeOpacity='0.5'
//               className='pointer-events-none'
//             />
//             <rect
//               width='140'
//               height='3'
//               rx='1.5'
//               y='0'
//               fill='hsl(var(--concentrate))'
//               opacity='0.5'
//             />
//             <text
//               x='70'
//               y='24'
//               textAnchor='middle'
//               fontSize='9'
//               fill='hsl(var(--concentrate))'
//               letterSpacing='2'
//               fontWeight='700'
//             >
//               REJECT
//             </text>
//             <text
//               x='70'
//               y='46'
//               textAnchor='middle'
//               fontSize='15'
//               fill='hsl(var(--foreground))'
//               fontWeight='600'
//               fontFamily='Open Sans'
//             >
//               {rejectFlow.toFixed(1)} m³/h
//             </text>
//             <text
//               x='70'
//               y='65'
//               textAnchor='middle'
//               fontSize='10'
//               fill='hsl(var(--muted-foreground))'
//               fontFamily='JetBrains Mono'
//             >
//               TDS {rejectTDS} mg/L
//             </text>
//           </g>
//         </svg>
//       </div>
//     </div>
//   );
// }

'use client';

import React from 'react';

interface Props {
  feedFlow?: number;
  permeateFlow?: number;
  rejectFlow?: number;
  recovery?: number;
  pumpPressure?: number;
  feedTDS?: number;
  permeateTDS?: number;
  rejectTDS?: number;
  stages?: { vessels: number; elements: number }[];
  boosterPressures?: number[];
  // Legacy props
  stage1?: { vessels: number; elements: number };
  stage2?: { vessels: number; elements: number };
  stage3?: { vessels: number; elements: number };
}

// Industrial Color Palette
const COLORS = {
  bg: '#ffffff',
  grid: '#f1f5f9',
  feed: '#334155', // Slate 700 - Dominant solid
  permeate: '#0284c7', // Light Blue 600 - Dashed
  reject: '#ea580c', // Orange 600 - Dashed
  equipment: '#f8fafc', // Slate 50
  border: '#94a3b8', // Slate 400
  text: '#0f172a', // Slate 900
  textMuted: '#64748b', // Slate 500
};

// Engineering Instrument Bubble (P&ID standard)
const InstrumentTag = ({
  x,
  y,
  type,
  num,
  label,
  color = COLORS.feed,
}: {
  x: number;
  y: number;
  type: string;
  num: string | number;
  label?: string;
  color?: string;
}) => {
  const tooltipText = label ? `${type}-${num}: ${label}` : '';
  const tooltipWidth = tooltipText.length * 6.5 + 16;

  return (
    <g transform={`translate(${x}, ${y})`} className='group cursor-help'>
      {/* Instrument Circle */}
      <circle
        cx='0'
        cy='0'
        r='14'
        fill={COLORS.equipment}
        stroke={color}
        strokeWidth='1.5'
      />
      {/* Center Line */}
      <line x1='-14' y1='0' x2='14' y2='0' stroke={color} strokeWidth='1.5' />
      {/* Top Text (Type) */}
      <text
        x='0'
        y='-3'
        textAnchor='middle'
        fontSize='9'
        fontWeight='600'
        fontFamily='"Inter", sans-serif'
        fill={COLORS.text}
      >
        {type}
      </text>
      {/* Bottom Text (Number) */}
      <text
        x='0'
        y='10'
        textAnchor='middle'
        fontSize='9'
        fontWeight='600'
        fontFamily='"IBM Plex Mono", monospace'
        fill={COLORS.text}
      >
        {num}
      </text>

      {/* Hover Tooltip */}
      {label && (
        <g className='opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
          <rect
            x={-(tooltipWidth / 2)}
            y='-42'
            width={tooltipWidth}
            height='22'
            fill='#1e293b'
            rx='2'
          />
          <path d='M-4 -20 L0 -16 L4 -20 Z' fill='#1e293b' />
          <text
            x='0'
            y='-27'
            textAnchor='middle'
            fontSize='11'
            fill='#f8fafc'
            fontFamily='"Inter", sans-serif'
          >
            {tooltipText}
          </text>
        </g>
      )}
    </g>
  );
};

export function ProcessFlowDiagram({
  feedFlow = 120,
  permeateFlow = 90,
  rejectFlow = 30,
  recovery = 75,
  pumpPressure = 14.2,
  feedTDS = 2400,
  permeateTDS = 42,
  rejectTDS = 4850,
  stage1,
  stage2,
  stage3,
  stages: propStages,
  boosterPressures = [],
}: Props) {
  const activeStages =
    propStages ||
    ([stage1, stage2, stage3].filter(Boolean) as {
      vessels: number;
      elements: number;
    }[]);
  if (activeStages.length === 0) activeStages.push({ vessels: 8, elements: 7 });

  const STAGE_WIDTH = 260;
  const STAGE_GAP = 100;
  const START_X = 380;
  const endX =
    START_X + activeStages.length * (STAGE_WIDTH + STAGE_GAP) - STAGE_GAP + 120;
  const viewBoxWidth = Math.max(1280, endX + 240);

  return (
    <div className='relative w-full border border-slate-300 bg-white overflow-x-auto overflow-y-hidden'>
      <div className='min-w-max p-4'>
        <svg
          viewBox={`0 0 ${viewBoxWidth} 460`}
          className='w-full h-auto'
          style={{ maxHeight: 540, minWidth: viewBoxWidth }}
        >
          <defs>
            {/* Engineering Background Grid */}
            <pattern
              id='engineering-grid'
              width='20'
              height='20'
              patternUnits='userSpaceOnUse'
            >
              <path
                d='M 20 0 L 0 0 0 20'
                fill='none'
                stroke={COLORS.grid}
                strokeWidth='1'
              />
            </pattern>
            <pattern
              id='engineering-grid-major'
              width='100'
              height='100'
              patternUnits='userSpaceOnUse'
            >
              <rect width='100' height='100' fill='url(#engineering-grid)' />
              <path
                d='M 100 0 L 0 0 0 100'
                fill='none'
                stroke='#e2e8f0'
                strokeWidth='1'
              />
            </pattern>

            {/* Line Markers */}
            <marker
              id='arrow-feed'
              viewBox='0 0 10 10'
              refX='9'
              refY='5'
              markerWidth='6'
              markerHeight='6'
              orient='auto'
            >
              <path d='M0,1 L9,5 L0,9 Z' fill={COLORS.feed} />
            </marker>
            <marker
              id='arrow-permeate'
              viewBox='0 0 10 10'
              refX='9'
              refY='5'
              markerWidth='6'
              markerHeight='6'
              orient='auto'
            >
              <path d='M0,1 L9,5 L0,9 Z' fill={COLORS.permeate} />
            </marker>
            <marker
              id='arrow-reject'
              viewBox='0 0 10 10'
              refX='9'
              refY='5'
              markerWidth='6'
              markerHeight='6'
              orient='auto'
            >
              <path d='M0,1 L9,5 L0,9 Z' fill={COLORS.reject} />
            </marker>
          </defs>

          {/* Grid Background */}
          <rect
            width='100%'
            height='100%'
            fill='url(#engineering-grid-major)'
          />

          {/* LEGEND - Engineering Style */}
          <g transform='translate(20, 20)'>
            <rect
              width='180'
              height='120'
              fill={COLORS.bg}
              stroke={COLORS.border}
              strokeWidth='1.5'
            />
            <text
              x='10'
              y='20'
              fontSize='10'
              fontWeight='700'
              fontFamily='"Inter", sans-serif'
              fill={COLORS.text}
            >
              PFD LEGEND
            </text>
            <line
              x1='10'
              y1='30'
              x2='170'
              y2='30'
              stroke={COLORS.border}
              strokeWidth='1'
            />

            <line
              x1='10'
              y1='45'
              x2='40'
              y2='45'
              stroke={COLORS.feed}
              strokeWidth='2.5'
            />
            <text
              x='50'
              y='48'
              fontSize='10'
              fontFamily='"IBM Plex Mono", monospace'
              fill={COLORS.text}
            >
              Feed / Main Line
            </text>

            <line
              x1='10'
              y1='65'
              x2='40'
              y2='65'
              stroke={COLORS.permeate}
              strokeWidth='1.5'
              strokeDasharray='6 4'
            />
            <text
              x='50'
              y='68'
              fontSize='10'
              fontFamily='"IBM Plex Mono", monospace'
              fill={COLORS.text}
            >
              Permeate Line
            </text>

            <line
              x1='10'
              y1='85'
              x2='40'
              y2='85'
              stroke={COLORS.reject}
              strokeWidth='1.5'
              strokeDasharray='6 4'
            />
            <text
              x='50'
              y='88'
              fontSize='10'
              fontFamily='"IBM Plex Mono", monospace'
              fill={COLORS.text}
            >
              Concentrate Line
            </text>

            <circle
              cx='25'
              cy='105'
              r='5'
              fill='none'
              stroke={COLORS.feed}
              strokeWidth='1.5'
            />
            <line
              x1='20'
              y1='105'
              x2='30'
              y2='105'
              stroke={COLORS.feed}
              strokeWidth='1.5'
            />
            <text
              x='50'
              y='108'
              fontSize='10'
              fontFamily='"IBM Plex Mono", monospace'
              fill={COLORS.text}
            >
              Instrument Tag
            </text>
          </g>

          {/* RAW WATER SOURCE */}
          <g transform='translate(40, 220)'>
            <path
              d='M0 -30 L40 -30 L40 30 L0 30'
              fill='none'
              stroke={COLORS.feed}
              strokeWidth='2'
            />
            <line
              x1='10'
              y1='-30'
              x2='10'
              y2='30'
              stroke={COLORS.feed}
              strokeWidth='1'
              strokeDasharray='4 2'
            />
            <text
              x='-20'
              y='-45'
              fontSize='12'
              fontWeight='700'
              fontFamily='"Inter", sans-serif'
              fill={COLORS.text}
            >
              RAW WATER
            </text>
            <text
              x='-20'
              y='-30'
              fontSize='10'
              fontFamily='"IBM Plex Mono", monospace'
              fill={COLORS.textMuted}
            >
              TK-100
            </text>
          </g>

          {/* FEED LINE */}
          <line
            x1='80'
            y1='220'
            x2='240'
            y2='220'
            stroke={COLORS.feed}
            strokeWidth='2.5'
            markerEnd='url(#arrow-feed)'
          />

          <InstrumentTag
            x={120}
            y={220}
            type='FI'
            num='101'
            label='Feed Flow'
          />
          <g transform='translate(95, 245)'>
            <text
              fontSize='10'
              fontFamily='"IBM Plex Mono", monospace'
              fill={COLORS.text}
            >
              {feedFlow.toFixed(1)} m³/h
            </text>
          </g>

          <InstrumentTag
            x={165}
            y={220}
            type='CE'
            num='101'
            label='Feed Cond/TDS'
          />
          <g transform='translate(140, 190)'>
            <text
              fontSize='10'
              fontFamily='"IBM Plex Mono", monospace'
              fill={COLORS.text}
            >
              {feedTDS} mg/L
            </text>
          </g>

          {/* HP PUMP (P-101) */}
          <g transform='translate(260, 220)'>
            {/* Centrifugal Pump Symbol */}
            <circle
              cx='0'
              cy='0'
              r='24'
              fill={COLORS.equipment}
              stroke={COLORS.feed}
              strokeWidth='2'
            />
            <path
              d='M -14 12 L 14 12 L 0 -14 Z'
              fill='none'
              stroke={COLORS.feed}
              strokeWidth='2'
            />
            <line
              x1='0'
              y1='-24'
              x2='0'
              y2='-36'
              stroke={COLORS.feed}
              strokeWidth='2'
            />
            <line
              x1='-8'
              y1='-36'
              x2='8'
              y2='-36'
              stroke={COLORS.feed}
              strokeWidth='2'
            />

            <text
              x='0'
              y='40'
              textAnchor='middle'
              fontSize='11'
              fontWeight='700'
              fontFamily='"Inter", sans-serif'
              fill={COLORS.text}
            >
              P-101
            </text>
            <text
              x='0'
              y='52'
              textAnchor='middle'
              fontSize='10'
              fontFamily='"IBM Plex Mono", monospace'
              fill={COLORS.textMuted}
            >
              HP PUMP
            </text>
          </g>

          {/* PUMP DISCHARGE LINE */}
          <line
            x1='284'
            y1='220'
            x2={START_X}
            y2='220'
            stroke={COLORS.feed}
            strokeWidth='2.5'
            markerEnd='url(#arrow-feed)'
          />

          <InstrumentTag
            x={330}
            y={220}
            type='PI'
            num='101'
            label='HP Discharge Pressure'
          />
          <g transform='translate(310, 190)'>
            <text
              fontSize='10'
              fontFamily='"IBM Plex Mono", monospace'
              fill={COLORS.text}
            >
              {pumpPressure.toFixed(1)} bar
            </text>
          </g>

          {/* BYPASS LINE */}
          <path
            d={`M 200 220 L 200 60 L ${endX + 20} 60 L ${endX + 20} 145`}
            fill='none'
            stroke={COLORS.feed}
            strokeWidth='1.5'
            markerEnd='url(#arrow-feed)'
          />
          <text
            x='210'
            y='55'
            fontSize='10'
            fontFamily='"IBM Plex Mono", monospace'
            fill={COLORS.textMuted}
          >
            SYSTEM BYPASS / FLUSH
          </text>
          <InstrumentTag
            x={200 + (endX - 200) / 2}
            y={60}
            type='XV'
            num='101'
            label='Bypass Valve'
          />

          {/* MEMBRANE STAGES */}
          {activeStages.map((stage, idx) => {
            const x = START_X + idx * (STAGE_WIDTH + STAGE_GAP);
            const y = 140;
            const isLast = idx === activeStages.length - 1;
            const visualRows = Math.min(
              4,
              Math.max(1, Math.ceil(stage.vessels / 2)),
            );
            const skidHeight = 80 + visualRows * 30;

            return (
              <g key={`stage-${idx}`}>
                {/* INTER-STAGE BOOSTER */}
                {idx !== 0 && (
                  <g>
                    {/* Conc out from prev stage -> booster */}
                    <line
                      x1={x - STAGE_GAP}
                      y1={y + 110}
                      x2={x - STAGE_GAP / 2 - 16}
                      y2={y + 110}
                      stroke={COLORS.reject}
                      strokeWidth='2'
                    />

                    {/* Booster Pump */}
                    <g
                      transform={`translate(${x - STAGE_GAP / 2}, ${y + 110})`}
                    >
                      <circle
                        cx='0'
                        cy='0'
                        r='16'
                        fill={COLORS.equipment}
                        stroke={COLORS.feed}
                        strokeWidth='1.5'
                      />
                      <path
                        d='M -8 6 L 8 6 L 0 -8 Z'
                        fill='none'
                        stroke={COLORS.feed}
                        strokeWidth='1.5'
                      />

                      <text
                        x='0'
                        y='30'
                        textAnchor='middle'
                        fontSize='10'
                        fontWeight='700'
                        fontFamily='"Inter", sans-serif'
                        fill={COLORS.text}
                      >
                        BP-10{idx}
                      </text>
                      <text
                        x='0'
                        y='42'
                        textAnchor='middle'
                        fontSize='9'
                        fontFamily='"IBM Plex Mono", monospace'
                        fill={COLORS.textMuted}
                      >
                        +{boosterPressures[idx - 1] || 2.5} bar
                      </text>
                    </g>

                    {/* Booster -> Next Stage Feed */}
                    <path
                      d={`M ${x - STAGE_GAP / 2 + 16} ${y + 110} L ${x - 20} ${y + 110} L ${x - 20} 220 L ${x} 220`}
                      fill='none'
                      stroke={COLORS.feed}
                      strokeWidth='2.5'
                      markerEnd='url(#arrow-feed)'
                    />

                    <InstrumentTag
                      x={x - 20}
                      y={180}
                      type='PI'
                      num={`10${idx + 1}`}
                      color={COLORS.feed}
                      label='Booster Discharge'
                    />
                  </g>
                )}

                {/* SKID BOUNDARY */}
                <rect
                  x={x}
                  y={y}
                  width={STAGE_WIDTH}
                  height={skidHeight}
                  fill='none'
                  stroke={COLORS.border}
                  strokeWidth='1.5'
                  strokeDasharray='8 4'
                />
                <rect
                  x={x}
                  y={y}
                  width={STAGE_WIDTH}
                  height='24'
                  fill='#f8fafc'
                  stroke={COLORS.border}
                  strokeWidth='1.5'
                  strokeDasharray='8 4'
                />
                <text
                  x={x + 10}
                  y={y + 16}
                  fontSize='11'
                  fontWeight='700'
                  fontFamily='"Inter", sans-serif'
                  fill={COLORS.text}
                >
                  RO TRAIN {idx + 1}
                </text>
                <text
                  x={x + STAGE_WIDTH - 10}
                  y={y + 16}
                  textAnchor='end'
                  fontSize='10'
                  fontFamily='"IBM Plex Mono", monospace'
                  fill={COLORS.textMuted}
                >
                  {stage.vessels}V x {stage.elements}E
                </text>

                {/* PIPING MANIFOLDS */}
                {/* Feed Manifold (Left) */}
                <line
                  x1={x}
                  y1='220'
                  x2={x + 20}
                  y2='220'
                  stroke={COLORS.feed}
                  strokeWidth='2.5'
                />
                <line
                  x1={x + 20}
                  y1={y + 45}
                  x2={x + 20}
                  y2={y + 35 + visualRows * 30}
                  stroke={COLORS.feed}
                  strokeWidth='2.5'
                />

                {/* Permeate Header (Center) */}
                <line
                  x1={x + STAGE_WIDTH / 2}
                  y1={y + 45}
                  x2={x + STAGE_WIDTH / 2}
                  y2={y + 35 + visualRows * 30}
                  stroke={COLORS.permeate}
                  strokeWidth='1.5'
                  strokeDasharray='6 4'
                />

                {/* Concentrate Manifold (Right) */}
                <line
                  x1={x + STAGE_WIDTH - 20}
                  y1={y + 45}
                  x2={x + STAGE_WIDTH - 20}
                  y2={y + 35 + visualRows * 30}
                  stroke={COLORS.reject}
                  strokeWidth='2'
                />
                <line
                  x1={x + STAGE_WIDTH - 20}
                  y1={y + 110}
                  x2={x + STAGE_WIDTH}
                  y2={y + 110}
                  stroke={COLORS.reject}
                  strokeWidth='2'
                />

                {/* VESSELS */}
                {[...Array(visualRows)].map((_, r) => {
                  const vesselY = y + 50 + r * 30;
                  return (
                    <g key={r}>
                      {/* Connections to manifolds */}
                      <line
                        x1={x + 20}
                        y1={vesselY}
                        x2={x + 35}
                        y2={vesselY}
                        stroke={COLORS.feed}
                        strokeWidth='1.5'
                      />
                      <line
                        x1={x + STAGE_WIDTH - 35}
                        y1={vesselY}
                        x2={x + STAGE_WIDTH - 20}
                        y2={vesselY}
                        stroke={COLORS.reject}
                        strokeWidth='1.5'
                      />

                      {/* Pressure Vessel Body */}
                      <rect
                        x={x + 35}
                        y={vesselY - 8}
                        width={STAGE_WIDTH - 70}
                        height='16'
                        rx='8'
                        fill={COLORS.equipment}
                        stroke={COLORS.text}
                        strokeWidth='1.2'
                      />

                      {/* Vessel Internal Divider / Flow Direction */}
                      <line
                        x1={x + 45}
                        y1={vesselY - 8}
                        x2={x + 45}
                        y2={vesselY + 8}
                        stroke={COLORS.text}
                        strokeWidth='1'
                      />
                      <line
                        x1={x + STAGE_WIDTH - 45}
                        y1={vesselY - 8}
                        x2={x + STAGE_WIDTH - 45}
                        y2={vesselY + 8}
                        stroke={COLORS.text}
                        strokeWidth='1'
                      />

                      <path
                        d={`M ${x + STAGE_WIDTH / 2 - 10} ${vesselY - 3} L ${x + STAGE_WIDTH / 2} ${vesselY} L ${x + STAGE_WIDTH / 2 - 10} ${vesselY + 3}`}
                        fill='none'
                        stroke={COLORS.border}
                        strokeWidth='1'
                      />

                      {/* Permeate connection */}
                      <line
                        x1={x + STAGE_WIDTH / 2}
                        y1={vesselY + 8}
                        x2={x + STAGE_WIDTH / 2}
                        y2={vesselY + 15}
                        stroke={COLORS.permeate}
                        strokeWidth='1'
                        strokeDasharray='4 2'
                      />
                    </g>
                  );
                })}

                {/* Permeate Out Routing */}
                <path
                  d={`M ${x + STAGE_WIDTH / 2} ${y + 45} L ${x + STAGE_WIDTH / 2} 100 L ${endX} 100`}
                  fill='none'
                  stroke={COLORS.permeate}
                  strokeWidth='1.5'
                  strokeDasharray='6 4'
                  markerEnd={
                    idx === activeStages.length - 1
                      ? 'url(#arrow-permeate)'
                      : ''
                  }
                />

                {/* Final Concentrate Out */}
                {isLast && (
                  <g>
                    <path
                      d={`M ${x + STAGE_WIDTH} ${y + 110} L ${endX - 60} ${y + 110} L ${endX - 60} 340 L ${endX} 340`}
                      fill='none'
                      stroke={COLORS.reject}
                      strokeWidth='2'
                      markerEnd='url(#arrow-reject)'
                    />

                    {/* Concentrate Control Valve (CV-301) */}
                    <g transform={`translate(${endX - 60}, 270)`}>
                      <path
                        d='M -10 -8 L 10 8 L 10 -8 L -10 8 Z'
                        fill={COLORS.bg}
                        stroke={COLORS.reject}
                        strokeWidth='1.5'
                      />
                      <line
                        x1='0'
                        y1='-8'
                        x2='0'
                        y2='-20'
                        stroke={COLORS.reject}
                        strokeWidth='1.5'
                      />
                      <line
                        x1='-6'
                        y1='-20'
                        x2='6'
                        y2='-20'
                        stroke={COLORS.reject}
                        strokeWidth='1.5'
                      />
                      <path
                        d='M -8 -20 Q 0 -28 8 -20 Z'
                        fill={COLORS.equipment}
                        stroke={COLORS.reject}
                        strokeWidth='1.5'
                      />
                      <text
                        x='25'
                        y='4'
                        fontSize='10'
                        fontWeight='700'
                        fontFamily='"Inter", sans-serif'
                        fill={COLORS.text}
                      >
                        CV-301
                      </text>
                    </g>
                  </g>
                )}
              </g>
            );
          })}

          {/* PERMEATE DESTINATION */}
          <g transform={`translate(${endX}, 80)`}>
            <rect
              x='0'
              y='0'
              width='120'
              height='60'
              fill={COLORS.equipment}
              stroke={COLORS.permeate}
              strokeWidth='2'
            />
            <line
              x1='0'
              y1='15'
              x2='120'
              y2='15'
              stroke={COLORS.permeate}
              strokeWidth='1'
            />
            <text
              x='10'
              y='35'
              fontSize='12'
              fontWeight='700'
              fontFamily='"Inter", sans-serif'
              fill={COLORS.text}
            >
              PERMEATE
            </text>
            <text
              x='10'
              y='50'
              fontSize='10'
              fontFamily='"IBM Plex Mono", monospace'
              fill={COLORS.textMuted}
            >
              TK-200
            </text>
          </g>

          <InstrumentTag
            x={endX - 40}
            y={100}
            type='FI'
            num='201'
            color={COLORS.permeate}
            label='Product Flow'
          />
          <text
            x={endX - 70}
            y='85'
            fontSize='10'
            fontFamily='"IBM Plex Mono", monospace'
            fill={COLORS.permeate}
          >
            {permeateFlow.toFixed(1)} m³/h
          </text>

          <InstrumentTag
            x={endX + 60}
            y={160}
            type='CE'
            num='201'
            color={COLORS.permeate}
            label='Product Quality'
          />
          <path
            d={`M ${endX + 60} 140 L ${endX + 60} 146`}
            stroke={COLORS.permeate}
            strokeWidth='1'
          />
          <text
            x={endX + 60}
            y='185'
            textAnchor='middle'
            fontSize='10'
            fontFamily='"IBM Plex Mono", monospace'
            fill={COLORS.permeate}
          >
            TDS: {permeateTDS} mg/L
          </text>
          <text
            x={endX + 60}
            y='198'
            textAnchor='middle'
            fontSize='10'
            fontFamily='"IBM Plex Mono", monospace'
            fill={COLORS.permeate}
          >
            REC: {recovery}%
          </text>

          {/* REJECT DESTINATION */}
          <g transform={`translate(${endX}, 320)`}>
            <rect
              x='0'
              y='0'
              width='120'
              height='40'
              fill={COLORS.equipment}
              stroke={COLORS.reject}
              strokeWidth='2'
            />
            <text
              x='10'
              y='25'
              fontSize='12'
              fontWeight='700'
              fontFamily='"Inter", sans-serif'
              fill={COLORS.text}
            >
              TO DRAIN
            </text>
          </g>

          <InstrumentTag
            x={endX - 30}
            y={340}
            type='FI'
            num='301'
            color={COLORS.reject}
            label='Reject Flow'
          />
          <text
            x={endX - 60}
            y='325'
            fontSize='10'
            fontFamily='"IBM Plex Mono", monospace'
            fill={COLORS.reject}
          >
            {rejectFlow.toFixed(1)} m³/h
          </text>

          <InstrumentTag
            x={endX + 60}
            y={380}
            type='CE'
            num='301'
            color={COLORS.reject}
            label='Reject Quality'
          />
          <path
            d={`M ${endX + 60} 360 L ${endX + 60} 366`}
            stroke={COLORS.reject}
            strokeWidth='1'
          />
          <text
            x={endX + 60}
            y='405'
            textAnchor='middle'
            fontSize='10'
            fontFamily='"IBM Plex Mono", monospace'
            fill={COLORS.reject}
          >
            TDS: {rejectTDS} mg/L
          </text>
        </svg>
      </div>
    </div>
  );
}
