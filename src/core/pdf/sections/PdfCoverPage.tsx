import React from 'react';
import { Page, View, Text, StyleSheet, Svg, Circle } from '@react-pdf/renderer';
import { PDF_COLORS, PDF_FONTS, PDF_PAGE, PDF_REPORT_META, PDF_SIZES } from '../constants/pdf.constants';
import type { FullEngineeringReport } from '@/core/reporting/models/report.models';

const s = StyleSheet.create({
  page: {
    backgroundColor: PDF_COLORS.cover,
    fontFamily: PDF_FONTS.sans,
    padding: 0,
  },
  topBar: {
    paddingHorizontal: 48,
    paddingTop: 44,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  logoArea: {
    flexDirection: 'column',
  },
  logoMark: {
    fontSize: 22,
    fontFamily: PDF_FONTS.sansBold,
    color: PDF_COLORS.textWhite,
    letterSpacing: 2,
  },
  logoSub: {
    fontSize: PDF_SIZES.small,
    fontFamily: PDF_FONTS.sans,
    color: PDF_COLORS.textWhite,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  versionBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderStyle: 'solid',
  },
  versionText: {
    fontSize: PDF_SIZES.tiny,
    fontFamily: PDF_FONTS.monoBold,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroDivider: {
    marginHorizontal: 48,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 52,
  },
  titleBlock: {
    paddingHorizontal: 48,
    marginBottom: 40,
  },
  reportType: {
    fontSize: PDF_SIZES.tiny,
    fontFamily: PDF_FONTS.sansBold,
    color: PDF_COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 32,
    fontFamily: PDF_FONTS.sansBold,
    color: PDF_COLORS.textWhite,
    lineHeight: 1.2,
    marginBottom: 6,
  },
  mainSubtitle: {
    fontSize: PDF_SIZES.h2,
    fontFamily: PDF_FONTS.sans,
    color: PDF_COLORS.textWhite,
    letterSpacing: 0.3,
  },
  accentRule: {
    marginHorizontal: 48,
    height: 2,
    backgroundColor: PDF_COLORS.primary,
    marginBottom: 40,
    width: 64,
  },
  projectBlock: {
    marginHorizontal: 48,
    marginBottom: 44,
    flexDirection: 'row',
    gap: 0,
  },
  projectCol: {
    flex: 1,
    paddingRight: 24,
  },
  projectItem: {
    marginBottom: 16,
  },
  projectLabel: {
    fontSize: PDF_SIZES.label,
    fontFamily: PDF_FONTS.sansBold,
    color: PDF_COLORS.textWhite,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  projectValue: {
    fontSize: PDF_SIZES.h3,
    fontFamily: PDF_FONTS.sans,
    color: PDF_COLORS.textWhite,
  },
  projectValueMono: {
    fontSize: PDF_SIZES.h3,
    fontFamily: PDF_FONTS.mono,
    color: PDF_COLORS.textWhite,
  },
  bottomBand: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: PDF_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
  },
  bandLeft: {
    fontSize: PDF_SIZES.small,
    fontFamily: PDF_FONTS.sansBold,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bandRight: {
    fontSize: PDF_SIZES.small,
    fontFamily: PDF_FONTS.mono,
    color: 'rgba(255,255,255,0.6)',
  },
  decoGrid: {
    position: 'absolute',
    right: 48,
    top: 120,
    opacity: 0.07,
  },
});

interface PdfCoverPageProps {
  report: FullEngineeringReport;
}

export function PdfCoverPage({ report }: PdfCoverPageProps) {
  const { metadata } = report;
  const dateStr = new Date(report.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Page size={PDF_PAGE.size} orientation="portrait" style={s.page}>
      <View style={s.decoGrid}>
        <Svg width="160" height="160" viewBox="0 0 160 160">
          {Array.from({ length: 8 }).map((_, row) =>
            Array.from({ length: 8 }).map((_, col) => (
              <Circle
                key={`${row}-${col}`}
                cx={col * 20 + 10}
                cy={row * 20 + 10}
                r={1.5}
                fill="white"
              />
            ))
          )}
        </Svg>
      </View>

      <View style={s.topBar}>
        <View style={s.logoArea}>
          <Text style={s.logoMark}>TRANSFILM</Text>
          <Text style={s.logoSub}>{PDF_REPORT_META.company.toUpperCase()}</Text>
        </View>
        <View style={s.versionBadge}>
          <Text style={s.versionText}>{PDF_REPORT_META.version}</Text>
        </View>
      </View>

      <View style={s.heroDivider} />

      <View style={s.titleBlock}>
        <Text style={s.reportType}>Engineering Design Report</Text>
        <Text style={s.mainTitle}>Reverse Osmosis{'\n'}System Analysis</Text>
        <Text style={s.mainSubtitle}>Professional Engineering Format</Text>
      </View>

      <View style={s.accentRule} />

      <View style={s.projectBlock}>
        <View style={s.projectCol}>
          <View style={s.projectItem}>
            <Text style={s.projectLabel}>Project Name</Text>
            <Text style={s.projectValue}>{metadata.projectName || 'Untitled Project'}</Text>
          </View>
          <View style={s.projectItem}>
            <Text style={s.projectLabel}>Customer</Text>
            <Text style={s.projectValue}>{metadata.customer || '—'}</Text>
          </View>
          <View style={s.projectItem}>
            <Text style={s.projectLabel}>Country / Location</Text>
            <Text style={s.projectValue}>{metadata.country || '—'}</Text>
          </View>
          <View style={s.projectItem}>
            <Text style={s.projectLabel}>Market Segment</Text>
            <Text style={s.projectValue}>{metadata.marketSegment || '—'}</Text>
          </View>
        </View>
        <View style={s.projectCol}>
          <View style={s.projectItem}>
            <Text style={s.projectLabel}>Project No.</Text>
            <Text style={s.projectValueMono}>{metadata.projectNo || '—'}</Text>
          </View>
          <View style={s.projectItem}>
            <Text style={s.projectLabel}>Case Name</Text>
            <Text style={s.projectValueMono}>{metadata.caseName || '—'}</Text>
          </View>
          <View style={s.projectItem}>
            <Text style={s.projectLabel}>Prepared By</Text>
            <Text style={s.projectValue}>{metadata.preparedBy || '—'}</Text>
          </View>
          <View style={s.projectItem}>
            <Text style={s.projectLabel}>Date Generated</Text>
            <Text style={s.projectValueMono}>{dateStr}</Text>
          </View>
        </View>
      </View>

      <View style={s.bottomBand}>
        <Text style={s.bandLeft}>Reverse Osmosis Design Analysis</Text>
        <Text style={s.bandRight}>Standard Engineering Format</Text>
      </View>
    </Page>
  );
}
