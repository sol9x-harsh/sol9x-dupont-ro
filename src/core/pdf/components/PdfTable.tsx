import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDF_COLORS, PDF_FONTS, PDF_SIZES } from '../constants/pdf.constants';

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderStyle: 'solid',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: PDF_COLORS.tableHeader,
    minHeight: PDF_SIZES.headerRowH,
    alignItems: 'center',
  },
  subheaderRow: {
    flexDirection: 'row',
    backgroundColor: PDF_COLORS.tableSubheader,
    minHeight: PDF_SIZES.headerRowH - 4,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    minHeight: PDF_SIZES.rowH,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.borderLight,
    borderTopStyle: 'solid',
  },
  rowAlt: {
    backgroundColor: PDF_COLORS.tableRowAlt,
  },
  cell: {
    paddingHorizontal: PDF_SIZES.cellPadH,
    paddingVertical: PDF_SIZES.cellPadV,
    flexShrink: 1,
  },
  cellText: {
    fontSize: PDF_SIZES.body,
    color: PDF_COLORS.textPrimary,
    fontFamily: PDF_FONTS.sans,
  },
  cellMono: {
    fontSize: PDF_SIZES.mono,
    color: PDF_COLORS.textPrimary,
    fontFamily: PDF_FONTS.mono,
  },
  headerText: {
    fontSize: PDF_SIZES.small,
    color: PDF_COLORS.tableHeaderText,
    fontFamily: PDF_FONTS.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  subheaderText: {
    fontSize: PDF_SIZES.small,
    color: PDF_COLORS.tableHeaderText,
    fontFamily: PDF_FONTS.sansBold,
    letterSpacing: 0.2,
  },
  dividerCell: {
    borderRightWidth: 1,
    borderRightColor: PDF_COLORS.borderLight,
    borderRightStyle: 'solid',
  },
  cellDivider: {
    borderRightWidth: 1,
    borderRightColor: PDF_COLORS.borderLight,
    borderRightStyle: 'solid',
  },
});

// ─── Column definition ────────────────────────────────────────────────────────

export interface PdfCol {
  key: string;
  label: string;
  width: string | number;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
  unit?: string;
}

// ─── Components ───────────────────────────────────────────────────────────────

interface TableProps {
  columns: PdfCol[];
  rows: Record<string, React.ReactNode>[];
  title?: string;
  wrap?: boolean;
}

export function PdfTable({ columns, rows, title, wrap = true }: TableProps) {
  return (
    <View style={s.table} wrap={wrap}>
      {title ? (
        <View style={s.subheaderRow}>
          <View style={[s.cell, { flex: 1 }]}>
            <Text style={s.subheaderText}>{title}</Text>
          </View>
        </View>
      ) : null}

      {/* Header */}
      <View style={s.headerRow} fixed>
        {columns.map((col, i) => (
          <View
            key={col.key}
            style={[
              s.cell,
              { width: col.width },
              i < columns.length - 1 ? s.dividerCell : {},
            ]}
          >
            <Text style={[s.headerText, { textAlign: col.align ?? 'left' }]}>
              {col.label}
              {col.unit ? `\n${col.unit}` : ''}
            </Text>
          </View>
        ))}
      </View>

      {/* Rows */}
      {rows.map((row, ri) => (
        <View
          key={ri}
          style={[s.row, ri % 2 !== 0 ? s.rowAlt : {}]}
          wrap={false}
        >
          {columns.map((col, ci) => (
            <View
              key={col.key}
              style={[
                s.cell,
                { width: col.width },
                ci < columns.length - 1 ? s.cellDivider : {},
              ]}
            >
              {typeof row[col.key] === 'string' || typeof row[col.key] === 'number' ? (
                <Text
                  style={[
                    col.mono ? s.cellMono : s.cellText,
                    { textAlign: col.align ?? 'left' },
                  ]}
                >
                  {String(row[col.key] ?? '—')}
                </Text>
              ) : (
                row[col.key]
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Two-column info table (key–value pairs) ──────────────────────────────────

interface InfoRow {
  label: string;
  value: string;
}

interface InfoTableProps {
  rows: InfoRow[];
  title?: string;
}

export function PdfInfoTable({ rows, title }: InfoTableProps) {
  const half = Math.ceil(rows.length / 2);
  const left = rows.slice(0, half);
  const right = rows.slice(half);

  return (
    <View style={s.table}>
      {title ? (
        <View style={s.headerRow}>
          <View style={[s.cell, { flex: 1 }]}>
            <Text style={s.headerText}>{title}</Text>
          </View>
        </View>
      ) : null}
      {left.map((row, i) => (
        <View
          key={i}
          style={[s.row, i % 2 !== 0 ? s.rowAlt : {}]}
          wrap={false}
        >
          {/* Left column */}
          <View style={[s.cell, { width: '22%' }, s.cellDivider]}>
            <Text style={[s.cellText, { color: PDF_COLORS.textMuted, fontFamily: PDF_FONTS.sansBold }]}>
              {row.label}
            </Text>
          </View>
          <View style={[s.cell, { width: '28%' }, s.cellDivider]}>
            <Text style={[s.cellMono, { color: PDF_COLORS.textPrimary }]}>
              {row.value}
            </Text>
          </View>
          {/* Right column */}
          {right[i] ? (
            <>
              <View style={[s.cell, { width: '22%' }, s.cellDivider]}>
                <Text style={[s.cellText, { color: PDF_COLORS.textMuted, fontFamily: PDF_FONTS.sansBold }]}>
                  {right[i].label}
                </Text>
              </View>
              <View style={[s.cell, { width: '28%' }]}>
                <Text style={[s.cellMono, { color: PDF_COLORS.textPrimary }]}>
                  {right[i].value}
                </Text>
              </View>
            </>
          ) : (
            <View style={{ width: '50%' }} />
          )}
        </View>
      ))}
    </View>
  );
}

// ─── Colored badge cell (for severity) ───────────────────────────────────────

interface BadgeCellProps {
  label: string;
  color: string;
  bgColor: string;
}

export function PdfBadge({ label, color, bgColor }: BadgeCellProps) {
  return (
    <View
      style={{
        backgroundColor: bgColor,
        borderRadius: 3,
        paddingHorizontal: 5,
        paddingVertical: 2,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ fontSize: PDF_SIZES.tiny, color, fontFamily: PDF_FONTS.sansBold, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
  );
}
