import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfPageTemplate } from '../templates/PdfPageTemplate';
import { PdfSectionHeader, PdfSubsection } from '../components/PdfSectionHeader';
import { PdfInfoTable, PdfTable } from '../components/PdfTable';
import { PDF_COLORS, PDF_FONTS, PDF_SIZES } from '../constants/pdf.constants';
import type { FullEngineeringReport } from '@/core/reporting/models/report.models';

const s = StyleSheet.create({
  warningBox: {
    marginTop: 14,
    backgroundColor: PDF_COLORS.warningBg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderStyle: 'solid',
    borderRadius: 3,
    padding: 10,
  },
  warningTitle: {
    fontSize: PDF_SIZES.small,
    fontFamily: PDF_FONTS.sansBold,
    color: PDF_COLORS.warning,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  warningItem: {
    fontSize: PDF_SIZES.small,
    fontFamily: PDF_FONTS.sans,
    color: PDF_COLORS.warning,
    marginBottom: 3,
  },
  noWarnings: {
    fontSize: PDF_SIZES.small,
    fontFamily: PDF_FONTS.sansOblique,
    color: PDF_COLORS.ok,
    marginTop: 8,
  },
});

interface Props {
  report: FullEngineeringReport;
}

export function PdfProjectMetadata({ report }: Props) {
  const { metadata } = report;
  const generatedDate = new Date(report.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const infoRows = [
    { label: 'Project No.', value: metadata.projectNo || '—' },
    { label: 'Project Name', value: metadata.projectName || '—' },
    { label: 'Case Name', value: metadata.caseName || '—' },
    { label: 'Prepared By', value: metadata.preparedBy || '—' },
    { label: 'Company', value: metadata.company || '—' },
    { label: 'Customer', value: metadata.customer || '—' },
    { label: 'Country', value: metadata.country || '—' },
    { label: 'Market Segment', value: metadata.marketSegment || '—' },
    { label: 'App Version', value: metadata.appVersion || '—' },
    { label: 'Date Created', value: metadata.dateCreated || '—' },
    { label: 'Last Modified', value: metadata.lastModified || '—' },
    { label: 'Generated At', value: generatedDate },
  ];

  const systemRows = [
    {
      metric: 'Total Passes',
      value: String(report.passes.length),
      unit: 'passes',
    },
    {
      metric: 'Total Elements',
      value: String(report.elements.length),
      unit: 'membranes',
    },
    {
      metric: 'System Recovery',
      value: `${report.systemOverview.roRecoveryPercent.toFixed(1)}%`,
      unit: 'overall',
    },
    {
      metric: 'System Feed Flow',
      value: `${report.systemOverview.systemFeedM3h.toFixed(2)}`,
      unit: 'm³/h',
    },
    {
      metric: 'System Permeate',
      value: `${report.systemOverview.systemPermeateM3h.toFixed(2)}`,
      unit: 'm³/h',
    },
    {
      metric: 'Average Flux',
      value: `${report.systemOverview.averageFluxLMH.toFixed(1)}`,
      unit: 'LMH',
    },
  ];

  const elementsRows = metadata.elements.map((el) => ({
    model: el.model,
    count: String(el.count),
    type: 'RO Membrane',
  }));

  return (
    <PdfPageTemplate
      projectName={metadata.projectName}
      generatedAt={generatedDate}
    >
      <PdfSectionHeader
        number="PROJECT INFORMATION"
        title="Project Metadata & System Configuration"
        subtitle="Engineering project details, design parameters, and system identification"
        accentColor={PDF_COLORS.primary}
      />

      <PdfInfoTable
        title="PROJECT IDENTIFICATION"
        rows={infoRows}
      />

      <PdfSubsection title="System Quick Reference" />

      <PdfTable
        columns={[
          { key: 'metric', label: 'Parameter', width: '45%' },
          { key: 'value', label: 'Value', width: '30%', align: 'right', mono: true },
          { key: 'unit', label: 'Unit', width: '25%', align: 'left' },
        ]}
        rows={systemRows}
      />

      {metadata.elements.length > 0 ? (
        <>
          <PdfSubsection title="Membrane Element Summary" />
          <PdfTable
            columns={[
              { key: 'model', label: 'Element Model', width: '55%' },
              { key: 'type', label: 'Type', width: '30%' },
              { key: 'count', label: 'Qty', width: '15%', align: 'right', mono: true },
            ]}
            rows={elementsRows}
          />
        </>
      ) : null}

      {/* Design Warnings Summary */}
      <PdfSubsection title="Design Warnings" marginTop={16} />
      {metadata.designWarnings.length === 0 ? (
        <Text style={s.noWarnings}>✓ No design warnings — system configuration is within recommended limits.</Text>
      ) : (
        <View style={s.warningBox}>
          <Text style={s.warningTitle}>⚠ Design Warnings ({metadata.designWarnings.length})</Text>
          {metadata.designWarnings.map((w, i) => (
            <Text key={i} style={s.warningItem}>· {w}</Text>
          ))}
        </View>
      )}
    </PdfPageTemplate>
  );
}
