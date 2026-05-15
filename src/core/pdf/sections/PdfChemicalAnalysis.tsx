import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfPageTemplate } from '../templates/PdfPageTemplate';
import { PdfSectionHeader, PdfSubsection, PdfKpiStrip } from '../components/PdfSectionHeader';
import { PdfTable } from '../components/PdfTable';
import { PdfBadge } from '../components/PdfTable';
import { PDF_COLORS, PDF_FONTS, PDF_SIZES } from '../constants/pdf.constants';
import type { FullEngineeringReport } from '@/core/reporting/models/report.models';

const s = StyleSheet.create({
  note: {
    marginTop: 8,
    padding: 8,
    backgroundColor: PDF_COLORS.bgMuted,
    borderLeftWidth: 2,
    borderLeftColor: PDF_COLORS.border,
    borderLeftStyle: 'solid',
  },
  noteText: {
    fontSize: PDF_SIZES.tiny,
    fontFamily: PDF_FONTS.sansOblique,
    color: PDF_COLORS.textMuted,
    lineHeight: 1.4,
  },
  lsiBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  lsiCard: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 3,
    padding: 10,
  },
  lsiLabel: {
    fontSize: PDF_SIZES.label,
    fontFamily: PDF_FONTS.sansBold,
    color: PDF_COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  lsiValue: {
    fontSize: PDF_SIZES.h2,
    fontFamily: PDF_FONTS.monoBold,
  },
  lsiDesc: {
    fontSize: PDF_SIZES.tiny,
    fontFamily: PDF_FONTS.sans,
    color: PDF_COLORS.textMuted,
    marginTop: 3,
  },
});

function lsiColor(lsi: number | null): string {
  if (lsi === null) return PDF_COLORS.textMuted;
  if (lsi > 1.5) return PDF_COLORS.critical;
  if (lsi > 0) return PDF_COLORS.warning;
  return PDF_COLORS.ok;
}

function lsiInterpret(lsi: number | null): string {
  if (lsi === null) return 'Not calculated';
  if (lsi > 1.5) return 'High scaling risk';
  if (lsi > 0) return 'Moderate scaling tendency';
  if (lsi > -0.5) return 'Slight corrosion tendency';
  return 'Corrosive — treatment recommended';
}

interface Props {
  report: FullEngineeringReport;
  generatedAt: string;
}

export function PdfChemicalAnalysis({ report, generatedAt }: Props) {
  const sa = report.soluteAnalysis;
  const scaling = report.scalingAnalysis;

  // pH summary KPIs
  const phKpis = [
    {
      label: 'Feed pH',
      value: sa.feedPH.toFixed(2),
      color: PDF_COLORS.feed,
    },
    {
      label: 'Adj. Feed pH',
      value: sa.adjustedPH.toFixed(2),
      color: PDF_COLORS.primaryMid,
    },
    {
      label: 'Concentrate pH',
      value: sa.concentratePH.toFixed(2),
      color: PDF_COLORS.reject,
    },
    {
      label: 'Feed Cond.',
      value: Math.round(sa.feedConductivityUScm).toLocaleString('en-US'),
      unit: 'µS/cm',
      color: PDF_COLORS.feed,
    },
    {
      label: 'Perm. Cond.',
      value: Math.round(sa.permeateConductivityUScm).toLocaleString('en-US'),
      unit: 'µS/cm',
      color: PDF_COLORS.permeate,
    },
    {
      label: 'Conc. Cond.',
      value: Math.round(sa.concentrateConductivityUScm).toLocaleString('en-US'),
      unit: 'µS/cm',
      color: PDF_COLORS.reject,
    },
  ];

  // Solute concentration columns
  const soluteCols = [
    { key: 'ion', label: 'Ion / Parameter', width: '24%' },
    { key: 'rawFeed', label: 'Raw Feed\nmg/L', width: '19%', align: 'right' as const, mono: true },
    { key: 'adjFeed', label: 'pH-Adj. Feed\nmg/L', width: '19%', align: 'right' as const, mono: true },
    { key: 'concentrate', label: 'Concentrate\nmg/L', width: '19%', align: 'right' as const, mono: true },
    { key: 'permeate', label: 'Permeate\nmg/L', width: '19%', align: 'right' as const, mono: true },
  ];

  const soluteRows = sa.rows.map((row) => ({
    ion: row.ion,
    rawFeed: row.rawFeedMgL,
    adjFeed: row.phAdjustedFeedMgL,
    concentrate: row.concentrateMgL,
    permeate: row.permeateMgL,
  }));

  // Scaling analysis columns
  const scalingCols = [
    { key: 'parameter', label: 'Scaling Parameter', width: '34%' },
    { key: 'beforePH', label: 'Before pH Adj.', width: '22%', align: 'right' as const, mono: true },
    { key: 'afterPH', label: 'After pH Adj.', width: '22%', align: 'right' as const, mono: true },
    { key: 'concentrate', label: 'Concentrate', width: '22%', align: 'right' as const, mono: true },
  ];

  const scalingRows = scaling.rows.map((row) => ({
    parameter: row.parameter,
    beforePH: row.beforePH,
    afterPH: row.afterPH,
    concentrate: row.concentrate,
  }));

  return (
    <PdfPageTemplate
      projectName={report.metadata.projectName}
      generatedAt={generatedAt}
    >
      <PdfSectionHeader
        number="SECTION III"
        title="Chemical & Scaling Analysis"
        subtitle="Ion concentrations across system streams, scaling indices, and saturation analysis"
        accentColor={PDF_COLORS.warning}
      />

      <PdfSubsection title="pH & Conductivity Profile" marginTop={0} />
      <PdfKpiStrip items={phKpis} />

      {/* LSI / SDI Summary Cards */}
      <PdfSubsection title="Scaling Risk Indicators" />
      <View style={s.lsiBox}>
        <View
          style={[
            s.lsiCard,
            {
              borderColor:
                scaling.lsi !== null && scaling.lsi > 0
                  ? PDF_COLORS.warning
                  : PDF_COLORS.border,
              backgroundColor:
                scaling.lsi !== null && scaling.lsi > 0
                  ? PDF_COLORS.warningBg
                  : PDF_COLORS.bgAlt,
            },
          ]}
        >
          <Text style={s.lsiLabel}>Langelier Saturation Index (LSI)</Text>
          <Text
            style={[
              s.lsiValue,
              { color: lsiColor(scaling.lsi) },
            ]}
          >
            {scaling.lsi !== null ? scaling.lsi.toFixed(2) : '—'}
          </Text>
          <Text style={s.lsiDesc}>{lsiInterpret(scaling.lsi)}</Text>
        </View>
        <View
          style={[
            s.lsiCard,
            {
              borderColor: PDF_COLORS.border,
              backgroundColor: PDF_COLORS.bgAlt,
            },
          ]}
        >
          <Text style={s.lsiLabel}>Stiff-Davis Index (SDI)</Text>
          <Text style={[s.lsiValue, { color: PDF_COLORS.textSecondary }]}>
            {scaling.sdix !== null ? scaling.sdix.toFixed(2) : '—'}
          </Text>
          <Text style={s.lsiDesc}>Stiff-Davis Saturation Index (brackish/SWRO)</Text>
        </View>
        <View
          style={[
            s.lsiCard,
            {
              borderColor: PDF_COLORS.border,
              backgroundColor: PDF_COLORS.bgSection,
            },
          ]}
        >
          <Text style={s.lsiLabel}>Scaling Assessment</Text>
          <Text
            style={[
              s.lsiValue,
              {
                fontSize: PDF_SIZES.h3,
                color:
                  scaling.lsi !== null && scaling.lsi > 1.5
                    ? PDF_COLORS.critical
                    : scaling.lsi !== null && scaling.lsi > 0
                    ? PDF_COLORS.warning
                    : PDF_COLORS.ok,
              },
            ]}
          >
            {scaling.lsi !== null && scaling.lsi > 1.5
              ? 'ANTISCALANT REQUIRED'
              : scaling.lsi !== null && scaling.lsi > 0
              ? 'TREATMENT RECOMMENDED'
              : 'ACCEPTABLE'}
          </Text>
          <Text style={s.lsiDesc}>Based on concentrate LSI at design conditions</Text>
        </View>
      </View>

      <PdfSubsection title="Ion Concentrations Across System Streams" />
      <PdfTable columns={soluteCols} rows={soluteRows} />

      <PdfSubsection title="Scaling Saturation Indices" />
      <PdfTable columns={scalingCols} rows={scalingRows} />

      <View style={s.note}>
        <Text style={s.noteText}>
          Concentrations calculated from charge-balance equations with Na⁺/Cl⁻ auto-balancing.
          Scaling indices computed at concentrate stream conditions. LSI: Langelier Saturation Index (CaCO₃ scaling tendency).
          Saturation % reflects ratio of ion product to solubility product at concentrate temperature and pH.
          Values &gt; 100% indicate supersaturation — antiscalant dosing required.
        </Text>
      </View>
    </PdfPageTemplate>
  );
}
