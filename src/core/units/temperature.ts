import { TEMP_ABSOLUTE_ZERO } from "@/core/constants/physics";
import type { TemperatureUnit } from "@/core/constants/units";

export const celsiusToKelvin = (c: number): number => c + TEMP_ABSOLUTE_ZERO;
export const kelvinToCelsius = (k: number): number => k - TEMP_ABSOLUTE_ZERO;
export const celsiusToFahrenheit = (c: number): number => (c * 9) / 5 + 32;
export const fahrenheitToCelsius = (f: number): number => ((f - 32) * 5) / 9;
export const kelvinToFahrenheit = (k: number): number => celsiusToFahrenheit(kelvinToCelsius(k));
export const fahrenheitToKelvin = (f: number): number => celsiusToKelvin(fahrenheitToCelsius(f));

/** Convert any supported unit to °C */
export function toCelsius(value: number, from: TemperatureUnit): number {
  switch (from) {
    case "°C": return value;
    case "°F": return fahrenheitToCelsius(value);
    case "K":  return kelvinToCelsius(value);
  }
}

/** Convert °C to any supported unit */
export function fromCelsius(value: number, to: TemperatureUnit): number {
  switch (to) {
    case "°C": return value;
    case "°F": return celsiusToFahrenheit(value);
    case "K":  return celsiusToKelvin(value);
  }
}
