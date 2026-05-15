'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, AlertTriangle, Info, ArrowRight } from "lucide-react";
import { useSimulationStore } from "@/store/simulation-store";
import {
  selectWarnings,
  selectValidationErrors,
} from "@/store/simulation/simulation-selectors";
import type { NormalizedWarning } from "@/store/simulation-store";

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

/** Engineering fix suggestions for each warning code. */
const FIX_MAP: Record<string, { impact: string; fix: string }> = {
  // NDP
  HYD_NDP_NEGATIVE: {
    impact: "Reverse flow risk — membrane cannot produce permeate at this operating envelope.",
    fix: "Reduce recovery or raise feed pressure to overcome osmotic pressure.",
  },
  HYD_NDP_NEAR_ZERO: {
    impact: "Effective driving pressure is insufficient for stable permeate production.",
    fix: "Increase feed pressure by 2–3 bar or reduce recovery by 5–10%.",
  },
  HYD_NDP_LOW: {
    impact: "Marginal driving pressure may cause unstable flux and poor salt rejection.",
    fix: "Consider increasing feed pressure or reducing recovery.",
  },
  // Recovery
  HYD_RECOVERY_CRITICAL: {
    impact: "Extreme concentration polarization and scaling risk. Concentrate becomes unmanageable.",
    fix: "Reduce system recovery or add antiscalant dosing.",
  },
  HYD_RECOVERY_HIGH: {
    impact: "Elevated scaling tendency — monitor LSI and silica saturation closely.",
    fix: "Consider reducing recovery or adding a concentrate treatment stage.",
  },
  HYD_RECOVERY_SINGLE_STAGE: {
    impact: "Single-stage recovery above 60% causes extreme element-to-element flux imbalance.",
    fix: "Add a second stage to distribute recovery more evenly.",
  },
  // Flux
  HYD_FLUX_CRITICAL: {
    impact: "Membrane compaction and accelerated fouling likely at this flux rate.",
    fix: "Reduce operating flux by lowering feed pressure or increasing membrane area.",
  },
  HYD_FLUX_AGGRESSIVE: {
    impact: "Elevated fouling risk — membrane cleaning frequency will increase.",
    fix: "Monitor fouling rate; consider adding membrane area.",
  },
  HYD_FLUX_LOW: {
    impact: "Sub-optimal membrane utilization — system may be over-designed.",
    fix: "Verify NDP and membrane permeability; reduce membrane area if appropriate.",
  },
  // Pressure
  HYD_PRESSURE_OVER_MAX: {
    impact: "Feed pressure exceeds membrane maximum — risk of mechanical failure.",
    fix: "Reduce feed pressure or select a higher-pressure-rated membrane.",
  },
  HYD_PERMEATE_BP_HIGH: {
    impact: "Elevated permeate back pressure reduces effective NDP and system efficiency.",
    fix: "Reduce permeate piping resistance or back-pressure setting.",
  },
  // CP
  HYD_CP_CRITICAL: {
    impact: "Severe concentration polarization at the membrane surface increases scaling and salt passage.",
    fix: "Reduce flux, increase cross-flow velocity, or add membrane area.",
  },
  // Scaling
  SCALING_LSI_CRITICAL: {
    impact: "High risk of CaCO₃ scaling in the concentrate stream.",
    fix: "Dose acid or antiscalant to reduce LSI below critical threshold.",
  },
  SCALING_LSI_HIGH: {
    impact: "Positive LSI indicates CaCO₃ precipitation tendency.",
    fix: "Consider acid dosing or antiscalant addition.",
  },
  SCALING_SDI_CRITICAL: {
    impact: "Stiff & Davis Index indicates CaCO₃ precipitation likely at elevated TDS.",
    fix: "Reduce recovery or add chemical pretreatment.",
  },
  SCALING_CASO4_HIGH: {
    impact: "Gypsum (CaSO₄) scaling risk in the concentrate stream.",
    fix: "Reduce recovery, add antiscalant, or reduce sulfate in feed.",
  },
  SCALING_BASO4_HIGH: {
    impact: "Barite (BaSO₄) scaling risk — extremely difficult to remove once deposited.",
    fix: "Add specific antiscalant for barium or reduce recovery.",
  },
  SCALING_SILICA_HIGH: {
    impact: "Silica polymerization risk — colloidal silica fouling is irreversible.",
    fix: "Reduce recovery, increase temperature, or add silica-specific antiscalant.",
  },
  // Quality
  QUAL_PERMEATE_TDS_CRITICAL: {
    impact: "Product water exceeds non-potable limits. System cannot meet quality targets.",
    fix: "Add a second pass, improve membrane selection, or reduce recovery.",
  },
  QUAL_PERMEATE_TDS_HIGH: {
    impact: "Permeate TDS exceeds potable water limits.",
    fix: "Consider second pass treatment or blending with higher-quality permeate.",
  },
  QUAL_BORON_CRITICAL: {
    impact: "Boron in permeate exceeds acceptable limits for most applications.",
    fix: "Use boron-selective membrane or raise feed pH above 10.",
  },
  QUAL_BORON_HIGH: {
    impact: "Permeate boron exceeds WHO guideline for drinking water.",
    fix: "Consider pH elevation or boron-selective membrane for second pass.",
  },
  // Chemistry
  CHEM_CHARGE_BALANCE_CRITICAL: {
    impact: "Feed chemistry data quality is suspect — simulation results unreliable.",
    fix: "Verify laboratory analysis. Check for missing ions or transcription errors.",
  },
  CHEM_TDS_CRITICAL: {
    impact: "Feed TDS is in critical range — verify membrane selection matches water type.",
    fix: "Confirm membrane model is rated for this salinity level.",
  },
  CHEM_OSMOTIC_CRITICAL: {
    impact: "Feed osmotic pressure exceeds typical SWRO operating range.",
    fix: "Verify feed pressure is sufficient; consider energy recovery devices.",
  },
  MEM_REJECTION_POOR: {
    impact: "Low salt rejection degrades permeate quality.",
    fix: "Verify membrane integrity; consider higher-rejection membrane model.",
  },
};

function getViolationDetails(w: NormalizedWarning) {
  const mapped = FIX_MAP[w.code];
  return {
    impact: mapped?.impact ?? "Operating condition outside normal engineering range.",
    fix: mapped?.fix ?? "Review system parameters and adjust operating conditions.",
  };
}

function severityBadge(severity: NormalizedWarning["severity"]) {
  switch (severity) {
    case "critical":
      return <Badge variant="outline" className="bg-danger-soft text-destructive border-destructive/40 text-[9px]">CRITICAL</Badge>;
    case "warning":
      return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/40 text-[9px]">WARNING</Badge>;
    default:
      return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/40 text-[9px]">INFO</Badge>;
  }
}

function severityBorderClass(severity: NormalizedWarning["severity"]) {
  switch (severity) {
    case "critical": return "border-destructive/30 bg-danger-soft/40";
    case "warning": return "border-warning/30 bg-warning/5";
    default: return "border-primary/30 bg-primary/5";
  }
}

function severityHeaderClass(severity: NormalizedWarning["severity"]) {
  switch (severity) {
    case "critical": return "border-destructive/20 bg-danger-soft/60";
    case "warning": return "border-warning/20 bg-warning/10";
    default: return "border-primary/20 bg-primary/10";
  }
}

export function ConstraintModal({ open, onOpenChange }: Props) {
  const warnings = useSimulationStore(selectWarnings);
  const validationErrors = useSimulationStore(selectValidationErrors);

  // Combine and sort: critical first, then warning, then info
  const allViolations: NormalizedWarning[] = [
    ...validationErrors,
    ...warnings.filter(w => w.severity === "critical" || w.severity === "warning"),
  ];

  const criticalCount = allViolations.filter(w => w.severity === "critical").length;
  const warningCount = allViolations.filter(w => w.severity === "warning").length;
  const hasCritical = criticalCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {hasCritical ? (
              <Badge variant="outline" className="bg-danger-soft text-destructive border-destructive/40">Constraint Violations</Badge>
            ) : warningCount > 0 ? (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/40">Design Warnings</Badge>
            ) : (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/40">System Healthy</Badge>
            )}
            <Badge variant="outline" className="font-mono text-[10px]">
              {criticalCount}C / {warningCount}W
            </Badge>
          </div>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <ShieldAlert className={`w-5 h-5 ${hasCritical ? 'text-destructive' : warningCount > 0 ? 'text-warning' : 'text-primary'}`} />
            {hasCritical ? "Hard Constraint Violations" : warningCount > 0 ? "Engineering Warnings" : "No Constraints Violated"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {allViolations.length > 0
              ? `${allViolations.length} constraint${allViolations.length !== 1 ? 's' : ''} detected from live simulation. ${hasCritical ? 'Critical issues must be resolved.' : 'Review warnings to optimize design.'}`
              : "All operating parameters are within acceptable engineering limits."}
          </p>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {allViolations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Info className="w-8 h-8 mx-auto mb-3 text-primary/40" />
              No constraint violations detected. System is operating within normal parameters.
            </div>
          )}
          {allViolations.map((v, idx) => {
            const details = getViolationDetails(v);
            return (
              <div key={`${v.code}-${idx}`} className={`rounded-lg border overflow-hidden ${severityBorderClass(v.severity)}`}>
                <div className={`px-4 py-3 flex items-center justify-between border-b ${severityHeaderClass(v.severity)}`}>
                  <div className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                    {severityBadge(v.severity)}
                    <span className="font-mono text-[10px] text-muted-foreground">{v.code}</span>
                  </div>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="text-xs text-foreground font-medium">{v.message}</div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Engineering implication</div>
                    <div className="text-xs text-foreground mt-0.5">{details.impact}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-primary font-bold">Suggested fix</div>
                    <div className="text-xs text-foreground mt-0.5">{details.fix}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {allViolations.length > 0 && (
          <div className="text-[11px] text-muted-foreground italic border-l-2 border-destructive/40 pl-3">
            Warnings are generated from live simulation outputs. Changing inputs will update this list automatically.
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {hasCritical ? "Review Inputs" : "Close"}
          </Button>
          {hasCritical && (
            <Button disabled className="bg-destructive/40 text-destructive-foreground">Run Calculation</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
