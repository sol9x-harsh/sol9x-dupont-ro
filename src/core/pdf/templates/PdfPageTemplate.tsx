import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDF_COLORS, PDF_FONTS, PDF_PAGE, PDF_REPORT_META, PDF_SIZES } from '../constants/pdf.constants';

const s = StyleSheet.create({
  page: {
    fontFamily: PDF_FONTS.sans,
    backgroundColor: PDF_COLORS.bg,
    paddingTop: PDF_SIZES.pagePadV + PDF_SIZES.headerH,
    paddingBottom: PDF_SIZES.pagePadV + PDF_SIZES.footerH,
    paddingHorizontal: PDF_SIZES.pagePadH,
  },

  // Fixed header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: PDF_SIZES.headerH + 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PDF_SIZES.pagePadH,
    paddingVertical: 8,
    backgroundColor: PDF_COLORS.primaryDark,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerCompany: {
    fontSize: PDF_SIZES.small,
    fontFamily: PDF_FONTS.sansBold,
    color: PDF_COLORS.textWhite,
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: PDF_SIZES.tiny,
    fontFamily: PDF_FONTS.sans,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerProject: {
    fontSize: PDF_SIZES.tiny,
    fontFamily: PDF_FONTS.sans,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  headerPage: {
    fontSize: PDF_SIZES.small,
    fontFamily: PDF_FONTS.monoBold,
    color: PDF_COLORS.textWhite,
    textAlign: 'right',
    minWidth: 30,
  },
  headerAccentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: PDF_COLORS.coverAccentLight,
  },

  // Fixed footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PDF_SIZES.footerH + 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PDF_SIZES.pagePadH,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
    borderTopStyle: 'solid',
    backgroundColor: PDF_COLORS.bgAlt,
  },
  footerLeft: {
    fontSize: PDF_SIZES.tiny,
    color: PDF_COLORS.textLight,
    fontFamily: PDF_FONTS.sans,
    flex: 1,
  },
  footerCenter: {
    fontSize: PDF_SIZES.tiny,
    color: PDF_COLORS.textMuted,
    fontFamily: PDF_FONTS.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
    flex: 1,
  },
  footerRight: {
    fontSize: PDF_SIZES.tiny,
    color: PDF_COLORS.textLight,
    fontFamily: PDF_FONTS.mono,
    textAlign: 'right',
    flex: 1,
  },
});

interface PdfPageTemplateProps {
  children: React.ReactNode;
  projectName?: string;
  generatedAt?: string;
}

export function PdfPageTemplate({
  children,
  projectName,
  generatedAt,
}: PdfPageTemplateProps) {
  return (
    <Page
      size={PDF_PAGE.size}
      orientation="portrait"
      style={s.page}
    >
      {/* Fixed Header */}
      <View style={s.header} fixed>
        <View style={s.headerLeft}>
          <Text style={s.headerCompany}>{PDF_REPORT_META.company}</Text>
          <Text style={s.headerSub}>{PDF_REPORT_META.software} · {PDF_REPORT_META.version}</Text>
        </View>
        <View style={s.headerRight}>
          {projectName ? (
            <Text style={s.headerProject}>{projectName}</Text>
          ) : null}
          <Text
            style={s.headerPage}
            render={({ pageNumber, totalPages }) =>
              `${String(pageNumber).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`
            }
          />
        </View>
        <View style={s.headerAccentLine} />
      </View>

      {/* Page Content */}
      {children}

      {/* Fixed Footer */}
      <View style={s.footer} fixed>
        <Text style={s.footerLeft}>
          {PDF_REPORT_META.disclaimer}
        </Text>
        <Text style={s.footerCenter} />
        <Text style={s.footerRight}>
          {generatedAt ?? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </Text>
      </View>
    </Page>
  );
}
