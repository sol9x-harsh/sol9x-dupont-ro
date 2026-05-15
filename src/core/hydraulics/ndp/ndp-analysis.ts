import { barToPsi, barToKpa } from "@/core/units/pressure";
import {
  NDP_INSUFFICIENT_THRESHOLD_BAR,
  NDP_MARGINAL_THRESHOLD_BAR,
  NDP_AGGRESSIVE_THRESHOLD_BAR,
  NDP_CRITICAL_THRESHOLD_BAR,
  NDP_MIN_VIABLE_BAR,
} from "@/core/hydraulics/ndp/ndp.constants";
import {
  calculateNDP,
  type NDPResult,
} from "@/core/hydraulics/ndp/ndp-calculation";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NDPStatus = "invalid" | "warning" | "normal" | "critical";
export type NDPClassification = "insufficient" | "marginal" | "normal" | "aggressive";

export interface NDPAnalysisResult {
  hydraulicDeltaPBar: number;
  osmoticPressureBar: number;
  ndpBar: number;
  ndpPsi: number;
  ndpKpa: number;
  status: NDPStatus;
  classification: NDPClassification;
  message: string;
}

export interface StageNDPResult {
  stageIndex: number;
  feedPressureBar: number;
  permeatePressureBar: number;
  osmoticPressureBar: number;
  ndp: NDPAnalysisResult;
}

export interface SystemNDPResult {
  stages: StageNDPResult[];
  lowestNdpBar: number;
  highestNdpBar: number;
  systemStatus: NDPStatus;
  systemMessage: string;
}

// ─── Classification helpers ───────────────────────────────────────────────────

function classifyNDP(ndpBar: number): NDPClassification {
  if (ndpBar < NDP_INSUFFICIENT_THRESHOLD_BAR) return "insufficient";
  if (ndpBar < NDP_MARGINAL_THRESHOLD_BAR) return "marginal";
  if (ndpBar < NDP_AGGRESSIVE_THRESHOLD_BAR) return "normal";
  return "aggressive";
}

function classifyNDPStatus(ndpBar: number): NDPStatus {
  if (ndpBar < NDP_MIN_VIABLE_BAR) return "invalid";
  if (ndpBar < NDP_MARGINAL_THRESHOLD_BAR) return "warning";
  if (ndpBar >= NDP_CRITICAL_THRESHOLD_BAR) return "critical";
  return "normal";
}

function buildMessage(classification: NDPClassification, ndpBar: number): string {
  switch (classification) {
    case "insufficient":
      return `NDP ${ndpBar.toFixed(2)} bar is insufficient — system cannot produce design flux. Increase feed pressure or reduce osmotic pressure.`;
    case "marginal":
      return `NDP ${ndpBar.toFixed(2)} bar is marginal — feasible but below recommended operating range. Review feed pressure and osmotic load.`;
    case "normal":
      return `NDP ${ndpBar.toFixed(2)} bar is within normal operating range.`;
    case "aggressive":
      return `NDP ${ndpBar.toFixed(2)} bar is aggressive — elevated membrane stress. Verify membrane pressure rating and element integrity.`;
  }
}

// ─── Single-point NDP analysis ────────────────────────────────────────────────

/**
 * Analyze NDP for a single operating point.
 * Returns invalid result if inputs are invalid.
 */
export function analyzeNDP(
  feedPressureBar: number,
  permeatePressureBar: number,
  osmoticPressureBar: number
): NDPAnalysisResult {
  const raw: NDPResult | null = calculateNDP(
    feedPressureBar,
    permeatePressureBar,
    osmoticPressureBar
  );

  if (raw === null) {
    return {
      hydraulicDeltaPBar: 0,
      osmoticPressureBar: 0,
      ndpBar: 0,
      ndpPsi: 0,
      ndpKpa: 0,
      status: "invalid",
      classification: "insufficient",
      message: "Invalid inputs — feed pressure, permeate pressure, or osmotic pressure is missing or out of range.",
    };
  }

  const classification = classifyNDP(raw.ndpBar);
  const status = classifyNDPStatus(raw.ndpBar);
  const message = buildMessage(classification, raw.ndpBar);

  return {
    hydraulicDeltaPBar: raw.hydraulicDeltaPBar,
    osmoticPressureBar: raw.osmoticPressureBar,
    ndpBar: raw.ndpBar,
    ndpPsi: raw.ndpPsi,
    ndpKpa: raw.ndpKpa,
    status,
    classification,
    message,
  };
}

// ─── Multi-stage NDP analysis ─────────────────────────────────────────────────

export interface StageNDPInput {
  feedPressureBar: number;
  permeatePressureBar: number;
  osmoticPressureBar: number;
}

/**
 * Analyze NDP for each stage independently.
 * Each stage receives its own feed pressure and osmotic pressure.
 * No iterative solving — deterministic single-point calculation per stage.
 */
export function analyzeMultiStageNDP(stages: StageNDPInput[]): SystemNDPResult {
  if (!stages.length) {
    return {
      stages: [],
      lowestNdpBar: 0,
      highestNdpBar: 0,
      systemStatus: "invalid",
      systemMessage: "No stages provided.",
    };
  }

  const stageResults: StageNDPResult[] = stages.map((s, i) => ({
    stageIndex: i + 1,
    feedPressureBar: s.feedPressureBar,
    permeatePressureBar: s.permeatePressureBar,
    osmoticPressureBar: s.osmoticPressureBar,
    ndp: analyzeNDP(s.feedPressureBar, s.permeatePressureBar, s.osmoticPressureBar),
  }));

  const ndpValues = stageResults.map((s) => s.ndp.ndpBar);
  const lowestNdpBar = Math.min(...ndpValues);
  const highestNdpBar = Math.max(...ndpValues);

  // System status is determined by the worst stage
  const hasInvalid = stageResults.some((s) => s.ndp.status === "invalid");
  const hasCritical = stageResults.some((s) => s.ndp.status === "critical");
  const hasWarning = stageResults.some((s) => s.ndp.status === "warning");

  let systemStatus: NDPStatus = "normal";
  if (hasInvalid) systemStatus = "invalid";
  else if (hasCritical) systemStatus = "critical";
  else if (hasWarning) systemStatus = "warning";

  const systemMessage =
    systemStatus === "normal"
      ? `All ${stages.length} stage(s) operating within normal NDP range. Lowest NDP: ${lowestNdpBar.toFixed(2)} bar.`
      : `System NDP issue detected. Lowest NDP: ${lowestNdpBar.toFixed(2)} bar. Review stage pressures and osmotic load.`;

  return {
    stages: stageResults,
    lowestNdpBar,
    highestNdpBar,
    systemStatus,
    systemMessage,
  };
}

/**
 * Propagate bulk NDP across stages using only the concentrate-end bulk osmotic pressure.
 * No CP surface amplification is applied here — CP correction is computed downstream
 * from actual flux (exp(Jw/k)) and fed back via a corrected NDP pass.
 *
 * concentratePressures: outlet pressures from pressure propagation (bar)
 * feedOsmoticPressureBar: feed-side osmotic pressure of stage 1
 * concentrationFactors: cumulative CF per stage (from flow engine)
 * permeatePressureBar: assumed constant across all stages (typically ~1 bar or atmospheric)
 */
export function propagateNDPAcrossStages(
  concentratePressures: number[],
  feedOsmoticPressureBar: number,
  concentrationFactors: number[],
  permeatePressureBar: number = 1.0
): SystemNDPResult {
  if (
    !concentratePressures.length ||
    concentratePressures.length !== concentrationFactors.length
  ) {
    return {
      stages: [],
      lowestNdpBar: 0,
      highestNdpBar: 0,
      systemStatus: "invalid",
      systemMessage: "Mismatched stage pressure and concentration factor arrays.",
    };
  }

  const stages: StageNDPInput[] = concentratePressures.map((outletPressure, i) => {
    const cf = Number.isFinite(concentrationFactors[i]) && concentrationFactors[i] > 0
      ? concentrationFactors[i]
      : 1;
    // Bulk osmotic pressure at concentrate end — CF propagates bulk concentration only.
    // CP surface amplification is applied separately after flux is known.
    const stageOsmoticPressure = feedOsmoticPressureBar * cf;

    return {
      feedPressureBar: outletPressure,
      permeatePressureBar,
      osmoticPressureBar: stageOsmoticPressure,
    };
  });

  return analyzeMultiStageNDP(stages);
}
