import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PdfPageTemplate } from '../templates/PdfPageTemplate';
import { PdfSectionHeader, PdfSubsection, PdfKpiStrip } from '../components/PdfSectionHeader';
import { PdfTable } from '../components/PdfTable';
import { PDF_COLORS, PDF_FONTS, PDF_SIZES } from '../constants/pdf.constants';
import type { FullEngineeringReport } from '@/core/reporting/models/report.models';

const s = StyleSheet.create({
  totalRow: {
    flexDirection: 'row',
    backgroundColor: PDF_COLORS.primaryDark,
    borderTopWidth: 2,
    borderTopColor: PDF_COLORS.primary,
    borderTopStyle: 'solid',
    padding: 8,
    marginTop: 2,
  },
  totalLabel: {
    flex: 1,
    fontSize: PDF_SIZES.body,
    fontFamily: PDF_FONTS.sansBold,
    color: PDF_COLORS.textWhite,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: PDF_SIZES.body,
    fontFamily: PDF_FONTS.monoBold,
    color: PDF_COLORS.textWhite,
    textAlign: 'right',
    minWidth: 80,
  },
  note: {
    marginTop: 8,
    padding: 8,
    backgroundColor: PDF_COLORS.bgMuted,
    borderLeftWidth: 2,
    borderLeftColor: PDF_COLORS.border,
    borderLeftStyle: 'solid',
  },
  noteText: {
    fontSize: PDF_SIZES.tiny,
    fontFamily: PDF_FONTS.sansOblique,
    color: PDF_COLORS.textMuted,
    lineHeight: 1.4,
  },
  assumptionsBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: PDF_COLORS.bgSection,
    borderWidth: 1,
    borderColor: PDF_COLORS.primaryLight,
    borderStyle: 'solid',
    borderRadius: 3,
  },
  assumptionsTitle: {
    fontSize: PDF_SIZES.small,
    fontFamily: PDF_FONTS.sansBold,
    color: PDF_COLORS.primary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  assumptionItem: {
    fontSize: PDF_SIZES.tiny,
    fontFamily: PDF_FONTS.mono,
    color: PDF_COLORS.textSecondary,
    marginBottom: 2,
    lineHeight: 1.4,
  },
});

interface Props {
  report: FullEngineeringReport;
  generatedAt: string;
}

export function PdfEconomicSummary({ report, generatedAt }: Props) {
  const costs = report.costs;
  const energy = report.energy;

  // Energy KPIs
  const energyKpis = [
    {
      label: 'Specific Energy',
      value: energy.specificEnergykWhM3.toFixed(3),
      unit: 'kWh/m³',
      color: PDF_COLORS.warning,
    },
    {
      label: 'Total Power',
      value: energy.totalPowerkW.toFixed(1),
      unit: 'kW',
      color: PDF_COLORS.primaryMid,
    },
    {
      label: 'Feed Pressure',
      value: energy.feedPressureBar.toFixed(1),
      unit: 'bar',
      color: PDF_COLORS.feed,
    },
    {
      label: 'System Recovery',
      value: `${energy.systemRecoveryPercent.toFixed(1)}%`,
      color: PDF_COLORS.primary,
    },
  ];

  // Water cost table
  const waterCols = [
    { key: 'category', label: 'Cost Category', width: '35%' },
    { key: 'flowRate', label: 'Flow Rate\nm³/h', width: '18%', align: 'right' as const, mono: true },
    { key: 'unitCost', label: 'Unit Cost\n$/m³', width: '16%', align: 'right' as const, mono: true },
    { key: 'hourlyCost', label: 'Hourly Cost\n$/hr', width: '16%', align: 'right' as const, mono: true },
    { key: 'dailyCost', label: 'Daily Cost\n$/day', width: '15%', align: 'right' as const, mono: true },
  ];

  const waterRows = costs.waterCosts.map((c) => ({
    category: c.category,
    flowRate: c.flowRateM3h.toFixed(2),
    unitCost: `$${c.unitCostPerM3.toFixed(3)}`,
    hourlyCost: `$${c.hourlyCost.toFixed(2)}`,
    dailyCost: `$${c.dailyCost.toFixed(2)}`,
  }));

  const totalWaterDaily = costs.waterCosts.reduce((s, c) => s + c.dailyCost, 0);

  // Energy cost table
  const energyCols = [
    { key: 'item', label: 'Energy Item', width: '30%' },
    { key: 'peakPower', label: 'Peak Power\nkW', width: '14%', align: 'right' as const, mono: true },
    { key: 'energy', label: 'Energy\nkWh/m³', width: '14%', align: 'right' as const, mono: true },
    { key: 'unitCost', label: 'Unit Cost\n$/kWh', width: '14%', align: 'right' as const, mono: true },
    { key: 'cost', label: 'Cost\n$/hr', width: '14%', align: 'right' as const, mono: true },
    { key: 'specEnergy', label: 'Specific\nkWh/m³', width: '14%', align: 'right' as const, mono: true },
  ];

  const energyRows = costs.energyCosts.map((c) => ({
    item: c.item,
    peakPower: c.peakPowerkW.toFixed(1),
    energy: c.energykWh.toFixed(1),
    unitCost: `$${c.unitCostPerKwh.toFixed(3)}`,
    cost: `$${c.cost.toFixed(2)}`,
    specEnergy: c.specificEnergykWhM3 != null ? c.specificEnergykWhM3.toFixed(3) : '—',
  }));

  const totalEnergyHourly = costs.energyCosts.reduce((s, c) => s + c.cost, 0);

  // Chemical cost table
  const chemCols = [
    { key: 'item', label: 'Chemical', width: '30%' },
    { key: 'dose', label: 'Dose\nmg/L', width: '14%', align: 'right' as const, mono: true },
    { key: 'volume', label: 'Volume\nkg/h', width: '14%', align: 'right' as const, mono: true },
    { key: 'unitCost', label: 'Unit Cost\n$/kg', width: '16%', align: 'right' as const, mono: true },
    { key: 'cost', label: 'Cost\n$/hr', width: '14%', align: 'right' as const, mono: true },
    { key: 'daily', label: 'Daily Cost\n$/day', width: '12%', align: 'right' as const, mono: true },
  ];

  const chemRows = costs.chemicalCosts.map((c) => ({
    item: c.item,
    dose: c.doseMgL.toFixed(2),
    volume: c.volumeKgH.toFixed(3),
    unitCost: `$${c.unitCostPerKg.toFixed(2)}`,
    cost: `$${c.cost.toFixed(2)}`,
    daily: `$${(c.cost * 24).toFixed(2)}`,
  }));

  const totalChemHourly = costs.chemicalCosts.reduce((s, c) => s + c.cost, 0);
  const totalOpex = totalWaterDaily + totalEnergyHourly * 24 + totalChemHourly * 24;

  return (
    <PdfPageTemplate
      projectName={report.metadata.projectName}
      generatedAt={generatedAt}
    >
      <PdfSectionHeader
        number="SECTION IV"
        title="Economic & Energy Summary"
        subtitle="Operating cost breakdown — water, energy, and chemical dosing expenditures at design conditions"
        accentColor={PDF_COLORS.warning}
      />

      <PdfSubsection title="Energy Performance Indicators" marginTop={0} />
      <PdfKpiStrip items={energyKpis} />

      <PdfSubsection title="Water & Disposal Costs" />
      <PdfTable columns={waterCols} rows={waterRows} />
      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Total Water & Disposal</Text>
        <Text style={s.totalValue}>${totalWaterDaily.toFixed(2)} / day</Text>
      </View>

      <PdfSubsection title="Energy Costs" />
      <PdfTable columns={energyCols} rows={energyRows} />
      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Total Energy Cost</Text>
        <Text style={s.totalValue}>${totalEnergyHourly.toFixed(2)} / hr</Text>
      </View>

      <PdfSubsection title="Chemical Dosing Costs" />
      {chemRows.length > 0 ? (
        <>
          <PdfTable columns={chemCols} rows={chemRows} />
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total Chemical Cost</Text>
            <Text style={s.totalValue}>${totalChemHourly.toFixed(2)} / hr</Text>
          </View>
        </>
      ) : (
        <Text
          style={{
            fontSize: PDF_SIZES.small,
            fontFamily: PDF_FONTS.sansOblique,
            color: PDF_COLORS.textMuted,
            marginTop: 6,
          }}
        >
          No chemical dosing configured for this design case.
        </Text>
      )}

      {/* Total OPEX summary */}
      <PdfSubsection title="Total Operating Cost Estimate" />
      <View
        style={{
          backgroundColor: PDF_COLORS.primaryDark,
          borderRadius: 4,
          padding: 14,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
          <Text
            style={{
              fontSize: PDF_SIZES.label,
              fontFamily: PDF_FONTS.sansBold,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            Estimated Total Daily OPEX
          </Text>
          <Text
            style={{
              fontSize: PDF_SIZES.h1,
              fontFamily: PDF_FONTS.monoBold,
              color: PDF_COLORS.textWhite,
            }}
          >
            ${totalOpex.toFixed(2)}
          </Text>
          <Text
            style={{
              fontSize: PDF_SIZES.tiny,
              fontFamily: PDF_FONTS.sans,
              color: 'rgba(255,255,255,0.4)',
              marginTop: 3,
            }}
          >
            Water + Energy + Chemical (24-hour operation)
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontSize: PDF_SIZES.label,
              fontFamily: PDF_FONTS.sansBold,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            Specific Energy
          </Text>
          <Text
            style={{
              fontSize: PDF_SIZES.h2,
              fontFamily: PDF_FONTS.monoBold,
              color: PDF_COLORS.coverAccentLight,
            }}
          >
            {energy.specificEnergykWhM3.toFixed(3)} kWh/m³
          </Text>
        </View>
      </View>

      {/* Assumptions */}
      <View style={s.assumptionsBox}>
        <Text style={s.assumptionsTitle}>Cost Model Assumptions</Text>
        <Text style={s.assumptionItem}>· Energy unit cost: $0.10/kWh · Pump efficiency: 80% · Motor efficiency: 95%</Text>
        <Text style={s.assumptionItem}>· Water cost: $0.12/m³ · Waste disposal: $0.08/m³</Text>
        <Text style={s.assumptionItem}>· Operating hours: 24 hr/day · Chemical costs per configured dose rates</Text>
        <Text style={s.assumptionItem}>· OPEX excludes CAPEX amortization, maintenance, labor, and membrane replacement</Text>
      </View>
    </PdfPageTemplate>
  );
}
