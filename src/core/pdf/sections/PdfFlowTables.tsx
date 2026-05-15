import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfPageTemplate } from '../templates/PdfPageTemplate';
import { PdfSectionHeader, PdfSubsection } from '../components/PdfSectionHeader';
import { PdfTable } from '../components/PdfTable';
import { PDF_COLORS, PDF_FONTS, PDF_SIZES } from '../constants/pdf.constants';
import type { FullEngineeringReport } from '@/core/reporting/models/report.models';

const s = StyleSheet.create({
  note: {
    marginTop: 6,
    padding: 7,
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
  pageBreakSpacer: {
    marginTop: 16,
  },
});

interface Props {
  report: FullEngineeringReport;
  generatedAt: string;
}

export function PdfFlowTables({ report, generatedAt }: Props) {
  const stages = report.stages;
  const elements = report.elements;

  // Stage hydraulic table columns — condensed for portrait
  const stageCols = [
    { key: 'stage', label: 'Stg', width: '5%', align: 'center' as const, mono: true },
    { key: 'array', label: 'Array (PV×El)', width: '12%', align: 'center' as const, mono: true },
    { key: 'feedFlow', label: 'Feed\nm³/h', width: '9%', align: 'right' as const, mono: true },
    { key: 'pressures', label: 'Press (F/C)\nbar', width: '13%', align: 'right' as const, mono: true },
    { key: 'pressDrop', label: 'ΔP\nbar', width: '7%', align: 'right' as const, mono: true },
    { key: 'concFlow', label: 'Conc\nm³/h', width: '9%', align: 'right' as const, mono: true },
    { key: 'permFlow', label: 'Perm\nm³/h', width: '9%', align: 'right' as const, mono: true },
    { key: 'avgFlux', label: 'Flux\nLMH', width: '8%', align: 'right' as const, mono: true },
    { key: 'permTds', label: 'P-TDS\nmg/L', width: '9%', align: 'right' as const, mono: true },
    { key: 'ndp', label: 'NDP\nbar', width: '8%', align: 'right' as const, mono: true },
    { key: 'recovery', label: 'Rec\n%', width: '8%', align: 'right' as const, mono: true },
  ];

  const stageRows = stages.map((s) => ({
    stage: String(s.stageIndex),
    array: `${s.vesselCount}×${s.elementsPerVessel}`,
    feedFlow: s.feedFlowM3h.toFixed(1),
    pressures: `${s.feedPressureBar.toFixed(1)}/${s.concentratePressureBar.toFixed(1)}`,
    pressDrop: s.pressureDropBar.toFixed(2),
    concFlow: s.concentrateFlowM3h.toFixed(1),
    permFlow: s.permeateFlowM3h.toFixed(1),
    avgFlux: s.avgFluxLMH.toFixed(1),
    permTds: Math.round(s.permeateTDSMgL).toLocaleString('en-US'),
    ndp: s.ndpBar.toFixed(2),
    recovery: s.recoveryPercent.toFixed(1),
  }));

  // Element detail table columns — adjusted for portrait
  const elementCols = [
    { key: 'name', label: 'Element', width: '14%', mono: true },
    { key: 'feedFlow', label: 'Feed\nm³/h', width: '10%', align: 'right' as const, mono: true },
    { key: 'feedPress', label: 'Press\nbar', width: '10%', align: 'right' as const, mono: true },
    { key: 'feedTds', label: 'F-TDS\nmg/L', width: '12%', align: 'right' as const, mono: true },
    { key: 'concFlow', label: 'Conc\nm³/h', width: '10%', align: 'right' as const, mono: true },
    { key: 'permFlow', label: 'Perm\nm³/h', width: '10%', align: 'right' as const, mono: true },
    { key: 'permFlux', label: 'Flux\nLMH', width: '10%', align: 'right' as const, mono: true },
    { key: 'permTds', label: 'P-TDS\nmg/L', width: '12%', align: 'right' as const, mono: true },
    { key: 'recovery', label: 'Rec\n%', width: '12%', align: 'right' as const, mono: true },
  ];

  const elementRows = elements.map((el) => ({
    name: el.name,
    feedFlow: el.feedFlowM3h.toFixed(2),
    feedPress: el.feedPressureBar.toFixed(1),
    feedTds: Math.round(el.feedTDSMgL).toLocaleString('en-US'),
    concFlow: el.concentrateFlowM3h.toFixed(2),
    permFlow: el.permeateFlowM3h.toFixed(2),
    permFlux: el.permeateFluxLMH.toFixed(1),
    permTds: Math.round(el.permeateTDSMgL).toLocaleString('en-US'),
    recovery: el.recoveryPercent.toFixed(1),
  }));

  return (
    <>
      {/* Stage hydraulics — portrait page */}
      <PdfPageTemplate
        projectName={report.metadata.projectName}
        generatedAt={generatedAt}
      >
        <PdfSectionHeader
          number="SECTION II"
          title="Flow & Performance Tables"
          subtitle="Stage-by-stage hydraulic performance, pressure profile, and flux distribution"
          accentColor={PDF_COLORS.permeate}
        />

        <PdfSubsection title="Stage Hydraulic Summary" marginTop={0} />
        <PdfTable columns={stageCols} rows={stageRows} wrap />

        <View style={s.note}>
          <Text style={s.noteText}>
            Stg = Stage · Array = Vessels × Elements/Vessel · Press (F/C) = Feed/Concentrate Pressure · 
            ΔP = Pressure Drop · P-TDS = Permeate TDS · NDP = Net Driving Pressure · Rec = Recovery.
          </Text>
        </View>
      </PdfPageTemplate>

      {/* Element detail — portrait */}
      <PdfPageTemplate
        projectName={report.metadata.projectName}
        generatedAt={generatedAt}
      >
        <PdfSectionHeader
          number="SECTION II — CONTINUED"
          title="Element Flow Detail"
          subtitle="Per-element hydraulic performance across all pressure vessels and stages"
          accentColor={PDF_COLORS.permeate}
        />

        <PdfSubsection title="Element-Level Performance Data" marginTop={0} />
        {elementRows.length > 0 ? (
          <PdfTable columns={elementCols} rows={elementRows} wrap />
        ) : (
          <Text
            style={{
              fontSize: PDF_SIZES.small,
              fontFamily: PDF_FONTS.sansOblique,
              color: PDF_COLORS.textMuted,
              marginTop: 10,
            }}
          >
            No element data available — run simulation to populate element-level calculations.
          </Text>
        )}

        <View style={s.note}>
          <Text style={s.noteText}>
            Element flow values computed from membrane transport equations: Jw = A(ΔP − Δπ), Js = B(Cm − Cp).
            Feed TDS increases along element path due to concentration polarization. Flux profile depends on NDP gradient.
          </Text>
        </View>
      </PdfPageTemplate>
    </>
  );
}
