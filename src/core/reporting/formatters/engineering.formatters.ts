// ─── Engineering-grade formatting utilities ───────────────────────────────────
// All formatters return strings safe for direct display in engineering reports.

function thousands(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatPressure(bar: number, decimals = 1): string {
  return `${bar.toFixed(decimals)} bar`;
}

export function formatFlow(m3h: number, decimals = 2): string {
  return `${m3h.toFixed(decimals)} m³/h`;
}

export function formatRecovery(percent: number, decimals = 1): string {
  return `${percent.toFixed(decimals)}%`;
}

export function formatConductivity(uScm: number, decimals = 0): string {
  return `${uScm.toFixed(decimals)} µS/cm`;
}

export function formatOsmoticPressure(bar: number, decimals = 2): string {
  return `${bar.toFixed(decimals)} bar`;
}

export function formatTDS(mgL: number, decimals = 0): string {
  if (mgL >= 1000) {
    return thousands(Math.round(mgL));
  }
  return mgL.toFixed(decimals);
}

export function formatFlux(lmh: number, decimals = 1): string {
  return `${lmh.toFixed(decimals)} LMH`;
}

export function formatEnergy(kWh: number, decimals = 3): string {
  return `${kWh.toFixed(decimals)} kWh/m³`;
}

export function formatPower(kW: number, decimals = 1): string {
  return `${kW.toFixed(decimals)} kW`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatPH(ph: number, decimals = 2): string {
  return ph.toFixed(decimals);
}

export function formatConcentrationFactor(cf: number, decimals = 2): string {
  return cf.toFixed(decimals);
}

export function formatArea(m2: number, decimals = 0): string {
  return `${m2.toFixed(decimals)} m²`;
}

export function formatCost(value: number, decimals = 2): string {
  return `$${value.toFixed(decimals)}`;
}

export function formatNDP(bar: number, decimals = 2): string {
  return `${bar.toFixed(decimals)} bar`;
}

export function formatTemperature(c: number, decimals = 1): string {
  return `${c.toFixed(decimals)} °C`;
}
