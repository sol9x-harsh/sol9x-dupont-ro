import {
  computeChargeBalance,
  type IonConcentrationMap,
  type ChargeBalanceResult,
} from "@/core/chemistry/balance/charge-balance";
import {
  BALANCE_VALID_PCT,
  BALANCE_WARNING_PCT,
  BALANCE_CRITICAL_PCT,
} from "@/core/chemistry/balance/balance.constants";

export type BalanceStatus = "valid" | "warning" | "critical" | "invalid";

export interface BalanceAnalysis {
  cationTotalMeq: number;
  anionTotalMeq: number;
  imbalancePercent: number;
  status: BalanceStatus;
  isBalanced: boolean;
  isComputable: boolean;
  message: string;
}

/**
 * Classify a charge imbalance percentage into an engineering severity level.
 * Mirrors the thresholds used in industrial water chemistry analysis.
 */
export function classifyBalanceStatus(
  imbalancePercent: number,
  isComputable: boolean
): BalanceStatus {
  if (!isComputable) return "invalid";
  if (imbalancePercent <= BALANCE_VALID_PCT) return "valid";
  if (imbalancePercent <= BALANCE_WARNING_PCT) return "warning";
  if (imbalancePercent <= BALANCE_CRITICAL_PCT) return "critical";
  return "invalid";
}

function buildMessage(
  status: BalanceStatus,
  imbalancePercent: number,
  isComputable: boolean
): string {
  if (!isComputable) {
    return "Insufficient ion data — charge balance cannot be computed.";
  }

  const pct = imbalancePercent.toFixed(2);

  switch (status) {
    case "valid":
      return `Charge balance acceptable: ${pct}% imbalance (≤ ${BALANCE_VALID_PCT}%).`;
    case "warning":
      return `Charge balance warning: ${pct}% imbalance. Review ion concentrations (threshold: ${BALANCE_WARNING_PCT}%).`;
    case "critical":
      return `Charge balance critical: ${pct}% imbalance. Data quality suspect — verify analysis before proceeding (threshold: ${BALANCE_CRITICAL_PCT}%).`;
    case "invalid":
      return `Charge balance invalid: ${pct}% imbalance exceeds ${BALANCE_CRITICAL_PCT}% limit. Chemistry data unreliable.`;
  }
}

/**
 * Perform a full charge balance analysis from a raw concentration map.
 * Returns a fully typed, serializable analysis object.
 */
export function analyzeChargeBalance(
  concentrations: IonConcentrationMap
): BalanceAnalysis {
  const result: ChargeBalanceResult = computeChargeBalance(concentrations);

  const status = classifyBalanceStatus(
    result.imbalancePercent,
    result.isComputable
  );

  const isBalanced = status === "valid";

  const message = buildMessage(
    status,
    result.imbalancePercent,
    result.isComputable
  );

  return {
    cationTotalMeq: result.cationTotalMeq,
    anionTotalMeq: result.anionTotalMeq,
    imbalancePercent: result.imbalancePercent,
    status,
    isBalanced,
    isComputable: result.isComputable,
    message,
  };
}
