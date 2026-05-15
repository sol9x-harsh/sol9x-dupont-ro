export {
  totalCationMeq,
  totalAnionMeq,
  calculateChargeImbalancePercent,
  computeChargeBalance,
} from "./charge-balance";

export type { IonConcentrationMap, ChargeBalanceResult } from "./charge-balance";

export { analyzeChargeBalance, classifyBalanceStatus } from "./balance-analysis";

export type { BalanceStatus, BalanceAnalysis } from "./balance-analysis";

export {
  BALANCE_VALID_PCT,
  BALANCE_WARNING_PCT,
  BALANCE_CRITICAL_PCT,
  BALANCE_MIN_TOTAL_MEQ_L,
} from "./balance.constants";
