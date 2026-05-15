import React from 'react';
import { View, Text, StyleSheet, Svg, Rect, Line, Polygon, Path } from '@react-pdf/renderer';
import { PdfPageTemplate } from '../templates/PdfPageTemplate';
import { PdfSectionHeader, PdfSubsection, PdfKpiStrip } from '../components/PdfSectionHeader';
import { PdfTable } from '../components/PdfTable';
import { PDF_COLORS, PDF_FONTS, PDF_SIZES } from '../constants/pdf.constants';
import type { FullEngineeringReport } from '@/core/reporting/models/report.models';

const s = StyleSheet.create({
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  summaryNote: {
    marginTop: 8,
    padding: 8,
    backgroundColor: PDF_COLORS.bgSection,
    borderLeftWidth: 3,
    borderLeftColor: PDF_COLORS.primary,
    borderLeftStyle: 'solid',
  },
  summaryNoteText: {
    fontSize: PDF_SIZES.small,
    fontFamily: PDF_FONTS.sans,
    color: PDF_COLORS.textSecondary,
    lineHeight: 1.5,
  },
});

interface Props {
  report: FullEngineeringReport;
  generatedAt: string;
}

export function PdfSystemOverview({ report, generatedAt }: Props) {
  const ov = report.systemOverview;
  const passes = report.passes;

  // KPI strip — top-level system metrics
  const kpis = [
    {
      label: 'RO Recovery',
      value: `${ov.roRecoveryPercent.toFixed(1)}%`,
      color: PDF_COLORS.primary,
    },
    {
      label: 'System Feed',
      value: ov.systemFeedM3h.toFixed(2),
      unit: 'm³/h',
      color: PDF_COLORS.feed,
    },
    {
      label: 'System Permeate',
      value: ov.systemPermeateM3h.toFixed(2),
      unit: 'm³/h',
      color: PDF_COLORS.permeate,
    },
    {
      label: 'Concentrate',
      value: ov.systemConcentrateM3h.toFixed(2),
      unit: 'm³/h',
      color: PDF_COLORS.reject,
    },
    {
      label: 'Avg Flux',
      value: ov.averageFluxLMH.toFixed(1),
      unit: 'LMH',
      color: PDF_COLORS.primaryMid,
    },
    {
      label: 'Min NDP',
      value: ov.lowestNdpBar.toFixed(2),
      unit: 'bar',
      color: PDF_COLORS.textSecondary,
    },
  ];

  const qualityKpis = [
    {
      label: 'Feed TDS',
      value: Math.round(ov.feedTDSMgL).toLocaleString('en-US'),
      unit: 'mg/L',
      color: PDF_COLORS.feed,
    },
    {
      label: 'Permeate TDS',
      value: Math.round(ov.permeateTDSMgL).toLocaleString('en-US'),
      unit: 'mg/L',
      color: PDF_COLORS.permeate,
    },
    {
      label: 'Concentrate TDS',
      value: Math.round(ov.concentrateTDSMgL).toLocaleString('en-US'),
      unit: 'mg/L',
      color: PDF_COLORS.reject,
    },
    {
      label: 'Max CP Factor',
      value: ov.maxCPFactor.toFixed(3),
      color:
        ov.maxCPFactor > 1.2
          ? PDF_COLORS.critical
          : ov.maxCPFactor > 1.13
          ? PDF_COLORS.warning
          : PDF_COLORS.ok,
    },
  ];

  // Pass summary table
  const passCols = [
    { key: 'name', label: 'Pass', width: '12%' },
    { key: 'waterType', label: 'Water Type', width: '13%' },
    { key: 'elements', label: 'Elements', width: '9%', align: 'right' as const, mono: true },
    { key: 'feedFlow', label: 'Feed Flow\nm³/h', width: '10%', align: 'right' as const, mono: true },
    { key: 'feedPressure', label: 'Feed Press\nbar', width: '10%', align: 'right' as const, mono: true },
    { key: 'permFlow', label: 'Perm Flow\nm³/h', width: '10%', align: 'right' as const, mono: true },
    { key: 'avgFlux', label: 'Avg Flux\nLMH', width: '9%', align: 'right' as const, mono: true },
    { key: 'permTds', label: 'Perm TDS\nmg/L', width: '9%', align: 'right' as const, mono: true },
    { key: 'recovery', label: 'Recovery\n%', width: '9%', align: 'right' as const, mono: true },
    { key: 'ndp', label: 'Avg NDP\nbar', width: '9%', align: 'right' as const, mono: true },
  ];

  const passRows = passes.map((p) => ({
    name: p.name,
    waterType: p.waterType,
    elements: String(p.numElements),
    feedFlow: p.feedFlowM3h.toFixed(2),
    feedPressure: p.feedPressureBar.toFixed(1),
    permFlow: p.permeateFlowM3h.toFixed(2),
    avgFlux: p.avgFluxLMH.toFixed(1),
    permTds: Math.round(p.permeateTDSMgL).toLocaleString('en-US'),
    recovery: p.netRecoveryPercent.toFixed(1),
    ndp: p.avgNdpBar.toFixed(2),
  }));

  // Stream table
  const streamCols = [
    { key: 'name', label: 'Stream', width: '30%' },
    { key: 'flow', label: 'Flow Rate\nm³/h', width: '20%', align: 'right' as const, mono: true },
    { key: 'tds', label: 'TDS\nmg/L', width: '20%', align: 'right' as const, mono: true },
    { key: 'pressure', label: 'Pressure\nbar', width: '15%', align: 'right' as const, mono: true },
    { key: 'id', label: 'Tag', width: '15%', mono: true },
  ];

  const streamRows = report.streams.map((s) => ({
    name: s.name,
    flow: s.flowM3h.toFixed(2),
    tds: Math.round(s.tdsMgL).toLocaleString('en-US'),
    pressure: s.pressureBar.toFixed(2),
    id: s.id,
  }));

  return (
    <PdfPageTemplate
      projectName={report.metadata.projectName}
      generatedAt={generatedAt}
    >
      <PdfSectionHeader
        number="SECTION I"
        title="System Overview & Performance Summary"
        subtitle="Overall RO system performance metrics, flow balance, and pass-level design summary"
        accentColor={PDF_COLORS.primary}
      />

      <PdfSubsection title="Key Performance Indicators" marginTop={0} />
      <PdfKpiStrip items={kpis} />

      <PdfSubsection title="Water Quality Summary" />
      <PdfKpiStrip items={qualityKpis} />

      <PdfSubsection title="Pass Summary" />
      <PdfTable columns={passCols} rows={passRows} />

      <PdfSubsection title="Design Streams" />
      <PdfTable columns={streamCols} rows={streamRows} />

      <View style={s.summaryNote}>
        <Text style={s.summaryNoteText}>
          All flow values reported at design temperature. Recovery calculated as system permeate ÷ system feed.
          NDP (Net Driving Pressure) = Applied ΔP − Osmotic pressure differential. Values reflect simulation output at design conditions.
        </Text>
      </View>
    </PdfPageTemplate>
  );
}
