import type { SoluteAnalysisReport, SoluteRowReport } from "@/core/reporting/models/report.models";
import type { SimulationOutput } from "@/core/simulation/outputs/simulation-output";
import type { IonComposition } from "@/store/feed-store";
import { formatTDS } from "@/core/reporting/formatters/engineering.formatters";

const ION_LABELS: Record<keyof IonComposition, string> = {
  // Cations
  ammonium:    "Ammonium (NH₄⁺)",
  sodium:      "Sodium (Na⁺)",
  potassium:   "Potassium (K⁺)",
  magnesium:   "Magnesium (Mg²⁺)",
  calcium:     "Calcium (Ca²⁺)",
  strontium:   "Strontium (Sr²⁺)",
  barium:      "Barium (Ba²⁺)",
  // Anions
  carbonate:   "Carbonate (CO₃²⁻)",
  bicarbonate: "Bicarbonate (HCO₃⁻)",
  nitrate:     "Nitrate (NO₃⁻)",
  fluoride:    "Fluoride (F⁻)",
  chloride:    "Chloride (Cl⁻)",
  bromide:     "Bromide (Br⁻)",
  sulfate:     "Sulfate (SO₄²⁻)",
  phosphate:   "Phosphate (PO₄³⁻)",
  // Neutrals
  silica:      "Silica (SiO₂)",
  boron:       "Boron (B)",
  co2:         "Carbon Dioxide (CO₂)",
};

export interface SoluteAnalysisBuilderInput {
  output: SimulationOutput;
  ions: IonComposition;
  feedPH: number;
  adjustedPH: number;
}

export function buildSoluteAnalysisReport(
  input: SoluteAnalysisBuilderInput
): SoluteAnalysisReport {
  const { output, ions, feedPH, adjustedPH } = input;
  const { summary, chemistry } = output;

  const cf = summary.feedTDSMgL > 0
    ? summary.concentrateTDSMgL / summary.feedTDSMgL
    : 1;
  const permeateFraction = summary.feedTDSMgL > 0
    ? summary.blendedPermeateTDSMgL / summary.feedTDSMgL
    : 0;

  const rows: SoluteRowReport[] = (Object.keys(ions) as (keyof IonComposition)[])
    .filter((key) => ions[key] > 0)
    .map((key) => {
      const rawFeed = ions[key];
      const concentrateMgL = rawFeed * cf;
      const permeateMgL = rawFeed * permeateFraction;

      return {
        ion: ION_LABELS[key],
        rawFeedMgL: formatTDS(rawFeed),
        phAdjustedFeedMgL: formatTDS(rawFeed),
        concentrateMgL: formatTDS(concentrateMgL),
        permeateMgL: formatTDS(permeateMgL, 2),
      };
    });

  // Append conductivity and pH rows
  const feedConductivity = chemistry.conductivity.conductivityUsCm;
  const concentrateConductivity = feedConductivity * cf;
  const permeateConductivity = feedConductivity * permeateFraction;

  rows.push({
    ion: "Conductivity (µS/cm)",
    rawFeedMgL: feedConductivity.toFixed(0),
    phAdjustedFeedMgL: feedConductivity.toFixed(0),
    concentrateMgL: concentrateConductivity.toFixed(0),
    permeateMgL: permeateConductivity.toFixed(1),
  });

  // Concentrate pH: increases slightly due to carbonate concentration
  // but buffered by CO2 equilibrium. Approximate as:
  //   ΔpH ≈ +0.3 × log10(CF) for typical carbonate-buffered waters
  const concentratePH = adjustedPH + 0.3 * Math.log10(Math.max(cf, 1));

  // Permeate pH: CO2 passes freely through RO membranes but ions are rejected,
  // creating a low-buffering-capacity permeate. Typical drop is 1-2 pH units.
  // Approximate using CO2 equilibrium: pH ≈ 6.35 - 0.5 × log10(CO2_conc) baseline
  // For simplicity: permeate pH ≈ adjusted feed pH - (0.5 + 0.3 × log10(CF))
  const permeatePH = Math.max(
    adjustedPH - (0.5 + 0.3 * Math.log10(Math.max(cf, 1))),
    4.5 // Floor: permeate pH rarely goes below 4.5
  );

  rows.push({
    ion: "pH",
    rawFeedMgL: feedPH.toFixed(2),
    phAdjustedFeedMgL: adjustedPH.toFixed(2),
    concentrateMgL: concentratePH.toFixed(2),
    permeateMgL: permeatePH.toFixed(2),
  });

  return {
    rows,
    feedPH,
    adjustedPH,
    concentratePH,
    feedConductivityUScm: feedConductivity,
    concentrateConductivityUScm: concentrateConductivity,
    permeateConductivityUScm: permeateConductivity,
  };
}
