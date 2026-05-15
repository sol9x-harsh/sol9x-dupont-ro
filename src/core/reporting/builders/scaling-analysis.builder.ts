import type { ScalingAnalysisReport, ScalingRowReport } from "@/core/reporting/models/report.models";
import type { SimulationOutput } from "@/core/simulation/outputs/simulation-output";
import type { IonComposition } from "@/store/feed-store";
import { formatPercent } from "@/core/reporting/formatters/engineering.formatters";
import { SCALING_THRESHOLDS } from "@/core/simulation/constants/simulation.constants";

/**
 * Scaling analysis is derived from simulation chemistry outputs.
 * LSI and SDI are approximated from ionic composition and concentration factor.
 * A full PHREEQC-grade scaling model is planned for a future phase.
 */
export function buildScalingAnalysisReport(
  output: SimulationOutput,
  ions: IonComposition
): ScalingAnalysisReport {
  const { summary, chemistry, adjustment: adj } = output;

  const cf = summary.feedTDSMgL > 0
    ? summary.concentrateTDSMgL / summary.feedTDSMgL
    : 1;

  // 1. LSI Analysis
  const lsiBefore = adj ? adj.beforeAdjustment.lsi : 0;
  const lsiAfter = adj ? adj.final.lsi : lsiBefore;
  const lsiConcentrate = lsiAfter + Math.log10(cf);

  // 2. SDI Analysis
  const sdiBefore = adj ? adj.beforeAdjustment.sdi : 0;
  const sdiAfter = adj ? adj.final.sdi : sdiBefore;
  const sdiConcentrate = sdiAfter + Math.log10(cf);

  // 3. Saturation percentages (concentrate)
  const currentIons = adj ? adj.final.ions : ions;
  
  // CaSO4: 2,320,000 is the simplified solubility product used in Studio
  const caSO4Sat = ((currentIons.calcium * cf) * (currentIons.sulfate * cf)) / (2_320_000) * 100;
  
  // BaSO4: 1.42 is the simplified Ksp in (mg/L)^2 at 25°C
  const baSO4Sat = ((currentIons.barium * cf) * (currentIons.sulfate * cf)) / (1.42) * 100;
  
  // SiO2: temperature-adjusted solubility
  const tempC = adj?.final.temperature || 25; // fallback to 25 if not in adjustment
  const tempFactor = 1 + 0.015 * (tempC - 25);
  const adjustedSio2Solubility = SCALING_THRESHOLDS.sio2BaseSolubilityMgL * Math.max(tempFactor, 0.5);
  
  const sio2Sat = (currentIons.silica * cf) / adjustedSio2Solubility * 100;

  const caSO4SatFeed = caSO4Sat / (cf * cf);
  const baSO4SatFeed = baSO4Sat / (cf * cf);
  const sio2SatFeed = sio2Sat / cf;

  const rows: ScalingRowReport[] = [
    {
      parameter: "LSI",
      beforePH: lsiBefore.toFixed(2),
      afterPH: lsiAfter.toFixed(2),
      concentrate: lsiConcentrate.toFixed(2),
    },
    {
      parameter: "Stiff & Davis Index",
      beforePH: sdiBefore.toFixed(2),
      afterPH: sdiAfter.toFixed(2),
      concentrate: sdiConcentrate.toFixed(2),
    },
    {
      parameter: "CaSO₄ (% Saturation)",
      beforePH: formatPercent(caSO4SatFeed, 0),
      afterPH: formatPercent(caSO4SatFeed, 0),
      concentrate: formatPercent(caSO4Sat, 0),
    },
    {
      parameter: "BaSO₄ (% Saturation)",
      beforePH: formatPercent(baSO4SatFeed, 0),
      afterPH: formatPercent(baSO4SatFeed, 0),
      concentrate: formatPercent(baSO4Sat, 0),
    },
    {
      parameter: "SiO₂ (% Saturation)",
      beforePH: formatPercent(sio2SatFeed, 0),
      afterPH: formatPercent(sio2SatFeed, 0),
      concentrate: formatPercent(sio2Sat, 0),
    },
  ];

  return {
    rows,
    lsi: lsiConcentrate,
    sdix: sdiConcentrate,
  };
}
