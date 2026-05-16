import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDF_COLORS, PDF_FONTS, PDF_SIZES } from '../constants/pdf.constants';

const s = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },
  accentBar: {
    height: 3,
    width: 32,
    marginBottom: 6,
    borderRadius: 2,
  },
  heading: {
    fontSize: PDF_SIZES.h2,
    fontFamily: PDF_FONTS.sansBold,
    color: PDF_COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: PDF_SIZES.small,
    fontFamily: PDF_FONTS.sansOblique,
    color: PDF_COLORS.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: PDF_COLORS.border,
    marginTop: 8,
  },
  sectionNumber: {
    fontSize: PDF_SIZES.label,
    fontFamily: PDF_FONTS.sansBold,
    color: PDF_COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
});

interface PdfSectionHeaderProps {
  number?: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
}

export function PdfSectionHeader({
  number,
  title,
  subtitle,
}: PdfSectionHeaderProps) {
  return (
    <View style={s.wrapper}>
      {number ? <Text style={s.sectionNumber}>{number}</Text> : null}
      <View style={[s.accentBar, { backgroundColor: PDF_COLORS.primary }]} />
      <Text style={s.heading}>{title}</Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      <View style={s.divider} />
    </View>
  );
}

// ─── Subsection label ─────────────────────────────────────────────────────────

interface PdfSubsectionProps {
  title: string;
  marginTop?: number;
}

export function PdfSubsection({ title, marginTop = 14 }: PdfSubsectionProps) {
  return (
    <View style={{ marginTop, marginBottom: 6 }}>
      <Text
        style={{
          fontSize: PDF_SIZES.h4,
          fontFamily: PDF_FONTS.sansBold,
          color: PDF_COLORS.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

// ─── KPI card strip ───────────────────────────────────────────────────────────

interface KpiItem {
  label: string;
  value: string;
  unit?: string;
  color?: string;
}

interface PdfKpiStripProps {
  items: KpiItem[];
}

export function PdfKpiStrip({ items }: PdfKpiStripProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 6,
        marginBottom: 12,
      }}
    >
      {items.map((item, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            backgroundColor: PDF_COLORS.bgMuted,
            borderWidth: 1,
            borderColor: PDF_COLORS.border,
            borderStyle: 'solid',
            borderRadius: 3,
            padding: 8,
          }}
        >
          <Text
            style={{
              fontSize: PDF_SIZES.label,
              fontFamily: PDF_FONTS.sansBold,
              color: PDF_COLORS.textMuted,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              marginBottom: 4,
            }}
          >
            {item.label}
          </Text>
          <Text
            style={{
              fontSize: PDF_SIZES.h3,
              fontFamily: PDF_FONTS.monoBold,
              color: item.color ?? PDF_COLORS.primary,
            }}
          >
            {item.value}
          </Text>
          {item.unit ? (
            <Text
              style={{
                fontSize: PDF_SIZES.tiny,
                fontFamily: PDF_FONTS.mono,
                color: PDF_COLORS.textLight,
                marginTop: 1,
              }}
            >
              {item.unit}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
