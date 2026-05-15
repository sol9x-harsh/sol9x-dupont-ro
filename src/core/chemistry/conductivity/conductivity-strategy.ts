import {
  CONDUCTIVITY_TDS_FACTORS_BY_CATEGORY,
  CONDUCTIVITY_TDS_FACTOR_DEFAULT,
  CONDUCTIVITY_TDS_FACTOR_SEAWATER,
  CONDUCTIVITY_SEAWATER_TDS_THRESHOLD_MG_L,
} from '@/core/chemistry/conductivity/conductivity.constants';

// ─── Water type — user-visible classification ─────────────────────────────────

export type WaterType =
  | 'RO/NF Permeate'
  | 'Softened Water'
  | 'Municipal Water'
  | 'Well Water'
  | 'Surface Water'
  | 'Sea Water'
  | 'Waste Water'
  | 'Custom';

// ─── Internal routing category ────────────────────────────────────────────────

export type WaterCategory =
  | 'freshwater'
  | 'brackish'
  | 'seawater'
  | 'wastewater';

// ─── Strategy descriptor ──────────────────────────────────────────────────────

export interface ConductivityStrategy {
  primaryMethod: 'tds' | 'ion-weighted';
  defaultFactor: number;
  useIonWeighted: boolean;
  useTdsPrimary: boolean;
}

// ─── Category resolution ──────────────────────────────────────────────────────

/**
 * Resolve a water type to an internal routing category.
 * For dynamic types (Well Water, Custom), TDS is used as the tiebreaker.
 */
export function getWaterCategory(
  waterType: WaterType,
  tdsMgL: number = 0,
): WaterCategory {
  switch (waterType) {
    case 'RO/NF Permeate':
    case 'Softened Water':
    case 'Municipal Water':
    case 'Surface Water':
      return 'freshwater';

    case 'Sea Water':
      return 'seawater';

    case 'Waste Water':
      return 'wastewater';

    case 'Well Water':
      // Well water can span fresh → brackish depending on TDS
      return tdsMgL > 5_000 ? 'brackish' : 'freshwater';

    case 'Custom':
    default:
      // Fall back to TDS-based classification for custom profiles
      if (tdsMgL > CONDUCTIVITY_SEAWATER_TDS_THRESHOLD_MG_L) return 'seawater';
      if (tdsMgL > 3_000) return 'brackish';
      return 'freshwater';
  }
}

// ─── Strategy resolution ──────────────────────────────────────────────────────

/**
 * Return the conductivity estimation strategy for a given water type.
 *
 * Routing rules:
 * - Sea Water / high-salinity → TDS primary (empirical seawater correlation)
 * - All other categories → ion-weighted primary (cross-checked against TDS)
 */
export function getConductivityStrategy(
  waterType: WaterType,
  tdsMgL: number = 0,
): ConductivityStrategy {
  const category = getWaterCategory(waterType, tdsMgL);

  if (category === 'seawater') {
    return {
      primaryMethod: 'tds',
      defaultFactor: CONDUCTIVITY_TDS_FACTOR_SEAWATER,
      useIonWeighted: false,
      useTdsPrimary: true,
    };
  }

  // Map water type → category key for factor lookup
  const categoryKey = waterTypeToCategoryKey(waterType, category);
  const defaultFactor =
    CONDUCTIVITY_TDS_FACTORS_BY_CATEGORY[categoryKey] ??
    CONDUCTIVITY_TDS_FACTOR_DEFAULT;

  // TDS-primary for all non-seawater types: the per-category factor gives the
  // authoritative display value; ion-weighted is kept as a cross-check diagnostic.
  return {
    primaryMethod: 'tds',
    defaultFactor,
    useIonWeighted: true,
    useTdsPrimary: true,
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function waterTypeToCategoryKey(
  waterType: WaterType,
  category: WaterCategory,
): string {
  switch (waterType) {
    case 'RO/NF Permeate':
      return 'ro-nf-permeate';
    case 'Softened Water':
      return 'softened-water';
    case 'Municipal Water':
      return 'municipal-water';
    case 'Well Water':
      return category === 'brackish' ? 'brackish' : 'well-water';
    case 'Surface Water':
      return 'surface-water';
    case 'Sea Water':
      return 'sea-water';
    case 'Waste Water':
      return 'waste-water';
    case 'Custom':
    default:
      return category === 'seawater'
        ? 'sea-water'
        : category === 'brackish'
          ? 'brackish'
          : 'municipal-water';
  }
}
