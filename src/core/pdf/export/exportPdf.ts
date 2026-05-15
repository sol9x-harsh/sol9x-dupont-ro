import type { FullEngineeringReport } from '@/core/reporting/models/report.models';

export type PdfExportStatus = 'idle' | 'generating' | 'done' | 'error';

export interface PdfExportOptions {
  selectedSections?: string[];
  filename?: string;
  onStatusChange?: (status: PdfExportStatus) => void;
}

/**
 * Generates and downloads an engineering-grade PDF report.
 *
 * Uses dynamic import to avoid SSR issues in Next.js App Router.
 * Safe to call from any 'use client' component.
 */
export async function generateEngineeringPDF(
  report: FullEngineeringReport,
  options: PdfExportOptions = {},
): Promise<void> {
  const {
    selectedSections = ['overview', 'flow', 'chemical', 'economic', 'pfd'],
    filename,
    onStatusChange,
  } = options;

  onStatusChange?.('generating');

  try {
    // Dynamic import — keeps react-pdf out of the SSR bundle
    const [{ pdf }, { createElement }, { EngineeringReportPDF }] =
      await Promise.all([
        import('@react-pdf/renderer'),
        import('react'),
        import('../generators/EngineeringReportPDF'),
      ]);

    // Build the PDF React element
    const element = createElement(EngineeringReportPDF, {
      report,
      selectedSections,
    });

    // Render to Blob
    const blob = await pdf(element).toBlob();

    // Determine filename
    const safeProjectName = report.metadata.projectName
      .replace(/[^a-zA-Z0-9\-_]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 40);

    const dateStamp = new Date(report.generatedAt)
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '');

    const outputFilename =
      filename ??
      `SOL9X_RO_Report_${safeProjectName}_${dateStamp}.pdf`;

    // Trigger browser download
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = outputFilename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Clean up object URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    onStatusChange?.('done');
  } catch (error) {
    onStatusChange?.('error');
    throw error;
  }
}
