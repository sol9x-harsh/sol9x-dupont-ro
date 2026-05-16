import React from 'react';
import { Document } from '@react-pdf/renderer';
import type { FullEngineeringReport } from '@/core/reporting/models/report.models';
import { PdfCoverPage } from '../sections/PdfCoverPage';
import { PdfProjectMetadata } from '../sections/PdfProjectMetadata';
import { PdfSystemOverview } from '../sections/PdfSystemOverview';
import { PdfFlowTables } from '../sections/PdfFlowTables';
import { PdfChemicalAnalysis } from '../sections/PdfChemicalAnalysis';
import { PdfEconomicSummary } from '../sections/PdfEconomicSummary';
import { PdfWarnings } from '../sections/PdfWarnings';
import { PdfSystemDiagram } from '../sections/PdfSystemDiagram';

// Section IDs must match those declared in ReportView.tsx
export type ReportSectionId = 'overview' | 'flow' | 'chemical' | 'economic' | 'pfd';

export interface EngineeringReportPDFProps {
  report: FullEngineeringReport;
  selectedSections: string[];
  pfdImage?: string;
}

export function EngineeringReportPDF({
  report,
  selectedSections,
  pfdImage,
}: EngineeringReportPDFProps) {
  const has = (id: ReportSectionId) => selectedSections.includes(id);

  const generatedAt = new Date(report.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Document
      title={`RO Engineering Report — ${report.metadata.projectName}`}
      author={report.metadata.preparedBy || 'Transfilm Engineering Services'}
      subject="Reverse Osmosis System Engineering Design Report"
      keywords="RO, reverse osmosis, membrane, engineering, Transfilm"
      creator="Transfilm RO Design Studio v2026.05"
      producer="Transfilm — @react-pdf/renderer"
    >
      {/* Cover page — always included */}
      <PdfCoverPage report={report} />

      {/* Project metadata — always included */}
      <PdfProjectMetadata report={report} />

      {/* Section I: System Overview */}
      {has('overview') && (
        <PdfSystemOverview report={report} generatedAt={generatedAt} />
      )}

      {/* Section II: Flow & Performance Tables */}
      {has('flow') && (
        <PdfFlowTables report={report} generatedAt={generatedAt} />
      )}

      {/* Section III: Chemical & Scaling Analysis */}
      {has('chemical') && (
        <PdfChemicalAnalysis report={report} generatedAt={generatedAt} />
      )}

      {/* Section IV: Economic Summary */}
      {has('economic') && (
        <PdfEconomicSummary report={report} generatedAt={generatedAt} />
      )}

      {/* Section V: Warnings */}
      <PdfWarnings report={report} generatedAt={generatedAt} />

      {/* Section VI: Process Flow Diagram */}
      {has('pfd') && (
        <PdfSystemDiagram 
          report={report} 
          generatedAt={generatedAt} 
          pfdImage={pfdImage}
        />
      )}
    </Document>
  );
}
