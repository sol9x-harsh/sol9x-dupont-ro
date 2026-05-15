import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfPageTemplate } from '../templates/PdfPageTemplate';
import { PdfSectionHeader, PdfSubsection } from '../components/PdfSectionHeader';
import { PDF_COLORS, PDF_FONTS, PDF_SIZES } from '../constants/pdf.constants';
import type { FullEngineeringReport } from '@/core/reporting/models/report.models';

const s = StyleSheet.create({
  warningItem: {
    flexDirection: 'row',
    marginBottom: 8,
    borderRadius: 3,
    overflow: 'hidden',
  },
  severityBar: {
    width: 4,
    borderRadius: 0,
  },
  warningContent: {
    flex: 1,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  severityBadge: {
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    minWidth: 54,
    alignItems: 'center',
  },
  severityText: {
    fontSize: PDF_SIZES.label,
    fontFamily: PDF_FONTS.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  warningCode: {
    fontSize: PDF_SIZES.tiny,
    fontFamily: PDF_FONTS.monoBold,
    color: PDF_COLORS.textMuted,
    minWidth: 70,
    marginTop: 2,
  },
  warningMessage: {
    flex: 1,
    fontSize: PDF_SIZES.body,
    fontFamily: PDF_FONTS.sans,
    color: PDF_COLORS.textPrimary,
    lineHeight: 1.4,
  },
  warningThreshold: {
    fontSize: PDF_SIZES.tiny,
    fontFamily: PDF_FONTS.mono,
    color: PDF_COLORS.textMuted,
    marginTop: 3,
  },
  noWarnings: {
    padding: 16,
    backgroundColor: PDF_COLORS.okBg,
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderStyle: 'solid',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noWarningsText: {
    fontSize: PDF_SIZES.body,
    fontFamily: PDF_FONTS.sansBold,
    color: PDF_COLORS.ok,
  },
  noWarningsSub: {
    fontSize: PDF_SIZES.small,
    fontFamily: PDF_FONTS.sans,
    color: '#15803D',
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    padding: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  summaryCardLabel: {
    fontSize: PDF_SIZES.label,
    fontFamily: PDF_FONTS.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: PDF_SIZES.h2,
    fontFamily: PDF_FONTS.monoBold,
  },
});

function severityStyle(severity: 'info' | 'warning' | 'critical') {
  switch (severity) {
    case 'critical':
      return {
        barColor: PDF_COLORS.critical,
        bg: PDF_COLORS.criticalBg,
        badgeBg: PDF_COLORS.critical,
        badgeText: '#FFFFFF',
        label: 'CRITICAL',
      };
    case 'warning':
      return {
        barColor: PDF_COLORS.warning,
        bg: PDF_COLORS.warningBg,
        badgeBg: '#D97706',
        badgeText: '#FFFFFF',
        label: 'WARNING',
      };
    default:
      return {
        barColor: PDF_COLORS.info,
        bg: PDF_COLORS.infoBg,
        badgeBg: PDF_COLORS.info,
        badgeText: '#FFFFFF',
        label: 'INFO',
      };
  }
}

interface Props {
  report: FullEngineeringReport;
  generatedAt: string;
}

export function PdfWarnings({ report, generatedAt }: Props) {
  const { warnings } = report;

  const criticalCount = warnings.warnings.filter((w) => w.severity === 'critical').length;
  const warningCount = warnings.warnings.filter((w) => w.severity === 'warning').length;
  const infoCount = warnings.warnings.filter((w) => w.severity === 'info').length;

  // Sort: critical → warning → info
  const sorted = [...warnings.warnings].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <PdfPageTemplate
      projectName={report.metadata.projectName}
      generatedAt={generatedAt}
    >
      <PdfSectionHeader
        number="SECTION V"
        title="Design Constraints & Warnings"
        subtitle="Simulation-generated warnings, constraint violations, and engineering advisory notes"
        accentColor={
          criticalCount > 0
            ? PDF_COLORS.critical
            : warningCount > 0
            ? PDF_COLORS.warning
            : PDF_COLORS.ok
        }
      />

      {/* Summary cards */}
      <View style={s.summaryRow}>
        <View
          style={[
            s.summaryCard,
            {
              borderColor: criticalCount > 0 ? PDF_COLORS.critical : PDF_COLORS.border,
              backgroundColor: criticalCount > 0 ? PDF_COLORS.criticalBg : PDF_COLORS.bgAlt,
            },
          ]}
        >
          <Text
            style={[
              s.summaryCardLabel,
              { color: criticalCount > 0 ? PDF_COLORS.critical : PDF_COLORS.textMuted },
            ]}
          >
            Critical
          </Text>
          <Text
            style={[
              s.summaryCardValue,
              { color: criticalCount > 0 ? PDF_COLORS.critical : PDF_COLORS.textLight },
            ]}
          >
            {String(criticalCount).padStart(2, '0')}
          </Text>
        </View>
        <View
          style={[
            s.summaryCard,
            {
              borderColor: warningCount > 0 ? '#D97706' : PDF_COLORS.border,
              backgroundColor: warningCount > 0 ? PDF_COLORS.warningBg : PDF_COLORS.bgAlt,
            },
          ]}
        >
          <Text
            style={[
              s.summaryCardLabel,
              { color: warningCount > 0 ? PDF_COLORS.warning : PDF_COLORS.textMuted },
            ]}
          >
            Warnings
          </Text>
          <Text
            style={[
              s.summaryCardValue,
              { color: warningCount > 0 ? PDF_COLORS.warning : PDF_COLORS.textLight },
            ]}
          >
            {String(warningCount).padStart(2, '0')}
          </Text>
        </View>
        <View
          style={[
            s.summaryCard,
            { borderColor: PDF_COLORS.border, backgroundColor: PDF_COLORS.bgAlt },
          ]}
        >
          <Text style={[s.summaryCardLabel, { color: PDF_COLORS.textMuted }]}>
            Informational
          </Text>
          <Text style={[s.summaryCardValue, { color: PDF_COLORS.textLight }]}>
            {String(infoCount).padStart(2, '0')}
          </Text>
        </View>
        <View
          style={[
            s.summaryCard,
            {
              borderColor:
                criticalCount > 0 || warningCount > 0 ? PDF_COLORS.warning : '#86EFAC',
              backgroundColor:
                criticalCount > 0 || warningCount > 0 ? PDF_COLORS.warningBg : PDF_COLORS.okBg,
            },
          ]}
        >
          <Text
            style={[
              s.summaryCardLabel,
              {
                color:
                  criticalCount > 0 || warningCount > 0 ? PDF_COLORS.warning : PDF_COLORS.ok,
              },
            ]}
          >
            Overall Status
          </Text>
          <Text
            style={[
              s.summaryCardValue,
              {
                fontSize: PDF_SIZES.h3,
                color:
                  criticalCount > 0
                    ? PDF_COLORS.critical
                    : warningCount > 0
                    ? PDF_COLORS.warning
                    : PDF_COLORS.ok,
              },
            ]}
          >
            {criticalCount > 0 ? 'REQUIRES REVIEW' : warningCount > 0 ? 'REVIEW ADVISED' : 'PASSED'}
          </Text>
        </View>
      </View>

      <PdfSubsection title="Warning Detail Log" marginTop={4} />

      {sorted.length === 0 ? (
        <View style={s.noWarnings}>
          <View>
            <Text style={s.noWarningsText}>✓ No warnings generated</Text>
            <Text style={s.noWarningsSub}>
              All design parameters are within recommended operating limits.
            </Text>
          </View>
        </View>
      ) : (
        sorted.map((w, i) => {
          const sv = severityStyle(w.severity);
          return (
            <View key={i} style={s.warningItem} wrap={false}>
              <View style={[s.severityBar, { backgroundColor: sv.barColor }]} />
              <View style={[s.warningContent, { backgroundColor: sv.bg }]}>
                <View style={[s.severityBadge, { backgroundColor: sv.badgeBg }]}>
                  <Text style={[s.severityText, { color: sv.badgeText }]}>{sv.label}</Text>
                </View>
                <Text style={s.warningCode}>{w.code}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.warningMessage}>{w.message}</Text>
                  {w.value != null && w.threshold != null ? (
                    <Text style={s.warningThreshold}>
                      Value: {w.value.toFixed(2)} · Threshold: {w.threshold.toFixed(2)}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          );
        })
      )}

      {/* Design warnings from metadata */}
      {report.metadata.designWarnings.length > 0 ? (
        <>
          <PdfSubsection title="Design Advisory Notes" marginTop={16} />
          {report.metadata.designWarnings.map((w, i) => (
            <View
              key={i}
              style={{
                marginBottom: 5,
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: PDF_COLORS.bgMuted,
                borderLeftWidth: 3,
                borderLeftColor: PDF_COLORS.warning,
                borderLeftStyle: 'solid',
              }}
              wrap={false}
            >
              <Text
                style={{
                  fontSize: PDF_SIZES.small,
                  fontFamily: PDF_FONTS.sans,
                  color: PDF_COLORS.textSecondary,
                  lineHeight: 1.4,
                }}
              >
                {w}
              </Text>
            </View>
          ))}
        </>
      ) : null}
    </PdfPageTemplate>
  );
}
