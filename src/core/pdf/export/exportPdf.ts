import type { FullEngineeringReport } from '@/core/reporting/models/report.models';

export type PdfExportStatus = 'idle' | 'generating' | 'done' | 'error';

export interface PdfExportOptions {
  selectedSections?: string[];
  filename?: string;
  pfdImage?: string;
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
      pfdImage: options.pfdImage,
    });

    // Render to Blob — cast needed: createElement returns a generic ReactElement
    // but pdf() expects ReactElement<DocumentProps>; the root component is a Document
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await pdf(element as any).toBlob();

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
      `Transfilm_RO_Report_${safeProjectName}_${dateStamp}.pdf`;

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
