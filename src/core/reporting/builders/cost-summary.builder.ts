import type { CostSummaryReport, EnergySummaryReport } from "@/core/reporting/models/report.models";
import type { SimulationOutput } from "@/core/simulation/outputs/simulation-output";
import type { ChemicalAdjustment } from "@/store/ro-config-store";
import {
  REPORT_DEFAULT_ENERGY_UNIT_COST,
  REPORT_DEFAULT_WATER_UNIT_COST,
  REPORT_DEFAULT_WASTE_UNIT_COST,
  REPORT_COST_ANTISCALANT,
  REPORT_COST_HCL,
  REPORT_COST_H2SO4,
  REPORT_COST_NAOH,
  REPORT_COST_SBS,
  REPORT_PUMP_EFFICIENCY,
  REPORT_MOTOR_EFFICIENCY,
  REPORT_HOURS_PER_DAY,
} from "@/core/reporting/constants/report.constants";

function estimatePumpPowerkW(
  feedFlowM3h: number,
  pressureBar: number,
  efficiency: number = REPORT_PUMP_EFFICIENCY * REPORT_MOTOR_EFFICIENCY
): number {
  // P(kW) = Q(m³/s) × ΔP(Pa) / η
  const flowM3s = feedFlowM3h / 3600;
  const pressurePa = pressureBar * 1e5;
  return (flowM3s * pressurePa) / (efficiency * 1000);
}

export function buildCostSummaryReport(
  output: SimulationOutput,
  chemicalAdjustment: ChemicalAdjustment
): CostSummaryReport {
  const { summary, hydraulics, adjustment: adj } = output;

  const feedFlowM3h = hydraulics.flows.feedFlowM3h;
  const feedPressure = hydraulics.pressures.feedPressureBar;
  const permeateM3h = summary.totalPermeateFlowM3h;
  const concentrateM3h = summary.concentrateFlowM3h;

  // Water costs
  const waterHourly = feedFlowM3h * REPORT_DEFAULT_WATER_UNIT_COST;
  const wasteHourly = concentrateM3h * REPORT_DEFAULT_WASTE_UNIT_COST;

  // Energy costs — HP pump + optional booster
  const hpPowerkW = estimatePumpPowerkW(feedFlowM3h, feedPressure);
  const hpEnergykWh = hpPowerkW;
  const hpCost = hpEnergykWh * REPORT_DEFAULT_ENERGY_UNIT_COST;
  const specificEnergy = permeateM3h > 0 ? hpEnergykWh / permeateM3h : 0;

  const energyCosts: CostSummaryReport["energyCosts"] = [
    {
      item: "High Pressure Pump",
      peakPowerkW: hpPowerkW * 1.1,
      energykWh: hpEnergykWh,
      unitCostPerKwh: REPORT_DEFAULT_ENERGY_UNIT_COST,
      cost: hpCost,
      specificEnergykWhM3: specificEnergy,
    },
  ];

  // Chemical costs
  const chemicalCosts: CostSummaryReport["chemicalCosts"] = [];
  
  // 1. Antiscalant
  if (chemicalAdjustment.antiScalantOn && chemicalAdjustment.antiScalantDose > 0) {
    const dose = chemicalAdjustment.antiScalantDose;
    const volumeKgH = (feedFlowM3h * dose) / 1000;
    chemicalCosts.push({
      item: `Antiscalant (${chemicalAdjustment.antiScalantChemical})`,
      unitCostPerKg: REPORT_COST_ANTISCALANT,
      doseMgL: dose,
      volumeKgH,
      cost: volumeKgH * REPORT_COST_ANTISCALANT,
    });
  }
  
  // 2. Acid
  if (adj && adj.acidDoseMgL > 0) {
    const dose = adj.acidDoseMgL;
    const volumeKgH = (feedFlowM3h * dose) / 1000;
    const unitCost = chemicalAdjustment.phDownChemical.includes('HCl') 
      ? REPORT_COST_HCL 
      : REPORT_COST_H2SO4;
      
    chemicalCosts.push({
      item: `Acid (${chemicalAdjustment.phDownChemical})`,
      unitCostPerKg: unitCost,
      doseMgL: dose,
      volumeKgH,
      cost: volumeKgH * unitCost,
    });
  }
  
  // 3. Base
  if (adj && adj.baseDoseMgL > 0) {
    const dose = adj.baseDoseMgL;
    const volumeKgH = (feedFlowM3h * dose) / 1000;
    chemicalCosts.push({
      item: `Base (${chemicalAdjustment.phUpChemical})`,
      unitCostPerKg: REPORT_COST_NAOH,
      doseMgL: dose,
      volumeKgH,
      cost: volumeKgH * REPORT_COST_NAOH,
    });
  }
  
  // 4. Dechlorinator
  if (adj && adj.dechlorinatorDoseMgL > 0) {
    const dose = adj.dechlorinatorDoseMgL;
    const volumeKgH = (feedFlowM3h * dose) / 1000;
    chemicalCosts.push({
      item: `Dechlorinator (${chemicalAdjustment.dechlorinatorChemical})`,
      unitCostPerKg: REPORT_COST_SBS,
      doseMgL: dose,
      volumeKgH,
      cost: volumeKgH * REPORT_COST_SBS,
    });
  }

  return {
    waterCosts: [
      {
        category: "Service Water",
        flowRateM3h: feedFlowM3h,
        unitCostPerM3: REPORT_DEFAULT_WATER_UNIT_COST,
        hourlyCost: waterHourly,
        dailyCost: waterHourly * REPORT_HOURS_PER_DAY,
      },
      {
        category: "Waste Water Disposal",
        flowRateM3h: concentrateM3h,
        unitCostPerM3: REPORT_DEFAULT_WASTE_UNIT_COST,
        hourlyCost: wasteHourly,
        dailyCost: wasteHourly * REPORT_HOURS_PER_DAY,
      },
    ],
    energyCosts,
    chemicalCosts,
  };
}

export function buildEnergySummaryReport(
  output: SimulationOutput
): EnergySummaryReport {
  const { summary, hydraulics } = output;

  const feedFlowM3h = hydraulics.flows.feedFlowM3h;
  const feedPressure = hydraulics.pressures.feedPressureBar;
  const permeateM3h = summary.totalPermeateFlowM3h;

  const totalPowerkW = estimatePumpPowerkW(feedFlowM3h, feedPressure);
  const specificEnergy = permeateM3h > 0 ? totalPowerkW / permeateM3h : 0;

  return {
    specificEnergykWhM3: specificEnergy,
    totalPowerkW,
    feedPressureBar: feedPressure,
    systemRecoveryPercent: summary.systemRecoveryPercent,
  };
}
