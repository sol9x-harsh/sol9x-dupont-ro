// ─── PDF Design System Constants ──────────────────────────────────────────────

export const PDF_COLORS = {
  // Brand
  primary: '#1E40AF',
  primaryDark: '#1E3A8A',
  primaryLight: '#DBEAFE',
  primaryMid: '#2563EB',

  // Flow stream colors
  feed: '#475569',
  permeate: '#1D4ED8',
  reject: '#C2410C',

  // Severity
  warning: '#B45309',
  warningBg: '#FEF3C7',
  critical: '#B91C1C',
  criticalBg: '#FEE2E2',
  info: '#0369A1',
  infoBg: '#E0F2FE',
  ok: '#15803D',
  okBg: '#DCFCE7',

  // Cover page
  cover: '#0F172A',
  coverMid: '#1E293B',
  coverAccent: '#1D4ED8',
  coverAccentLight: '#3B82F6',

  // Page background
  bg: '#FFFFFF',
  bgAlt: '#F8FAFC',
  bgSection: '#EFF6FF',
  bgMuted: '#F1F5F9',

  // Borders
  border: '#CBD5E1',
  borderLight: '#E2E8F0',
  borderDark: '#94A3B8',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#1E293B', // Darkened from #334155
  textMuted: '#475569', // Darkened from #64748B
  textLight: '#64748B', // Darkened from #94A3B8
  textWhite: '#FFFFFF',
  textAccent: '#1E40AF',

  // Table
  tableHeader: '#1E3A8A',
  tableHeaderText: '#FFFFFF',
  tableSubheader: '#334155',
  tableSubheaderText: '#FFFFFF',
  tableRowAlt: '#F8FAFC',
  tableRowHover: '#EFF6FF',
  tableBorder: '#CBD5E1',
} as const;

export const PDF_FONTS = {
  sans: 'Helvetica',
  sansBold: 'Helvetica-Bold',
  sansOblique: 'Helvetica-Oblique',
  mono: 'Courier',
  monoBold: 'Courier-Bold',
} as const;

export const PDF_SIZES = {
  // Font scale
  title: 28,
  h1: 18,
  h2: 13,
  h3: 10,
  h4: 9,
  body: 8.5,
  small: 7.5,
  tiny: 6.5,
  mono: 8,
  monoSmall: 7,
  label: 6,

  // Spacing
  pagePadH: 36,
  pagePadV: 44,
  sectionGap: 18,
  rowH: 18,
  headerRowH: 22,
  cellPadH: 6,
  cellPadV: 4,

  // Header/footer heights
  headerH: 36,
  footerH: 24,
} as const;

export const PDF_PAGE = {
  size: 'A4' as const,
  portrait: 'portrait' as const,
  landscape: 'landscape' as const,
  // A4 dimensions in points (1pt = 1/72 inch)
  widthPt: 595.28,
  heightPt: 841.89,
  landscapeWidthPt: 841.89,
  landscapeHeightPt: 595.28,
} as const;

export const PDF_REPORT_META = {
  company: 'SOL9X Engineering Services',
  software: 'SOL9X RO Design Studio',
  version: 'v2026.05',
  disclaimer: 'This document is confidential and intended for engineering use only.',
  format: 'Standard Engineering Format',
} as const;
