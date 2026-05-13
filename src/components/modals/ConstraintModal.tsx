'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ArrowRight } from "lucide-react";

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

const VIOLATIONS = [
  { name: "Net Driving Pressure (NDP)", current: "-1.4 bar", limit: "> 0 bar", impact: "Reverse flow risk - membrane cannot produce permeate at this operating envelope.", fix: "Reduce recovery to ≤ 70% or raise feed pressure by 1.8 bar." },
  { name: "SDI₁₅", current: "5.8", limit: "≤ 5.0", impact: "Particulate fouling will exceed warranty thresholds within 30 days.", fix: "Improve pre-treatment: add MMF or UF upstream of cartridge filters." },
];

export function ConstraintModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-danger-soft text-destructive border-destructive/40">Calculation Blocked</Badge>
            <Badge variant="outline" className="font-mono text-[10px]">§16.2</Badge>
          </div>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            Hard Constraint Violations
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {VIOLATIONS.length} constraints prevent the calculation from running. Resolve all of them to continue.
          </p>
        </DialogHeader>

        <div className="space-y-3">
          {VIOLATIONS.map(v => (
            <div key={v.name} className="rounded-lg border border-destructive/30 bg-danger-soft/40 overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between border-b border-destructive/20 bg-danger-soft/60">
                <div className="font-display font-semibold text-foreground text-sm">{v.name}</div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-destructive font-semibold">{v.current}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{v.limit}</span>
                </div>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Engineering implication</div>
                  <div className="text-xs text-foreground mt-0.5">{v.impact}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-primary font-bold">Suggested fix</div>
                  <div className="text-xs text-foreground mt-0.5">{v.fix}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-muted-foreground italic border-l-2 border-destructive/40 pl-3">
          Modal cannot be dismissed until all violations are resolved. Output panel will remain greyed out.
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Review Inputs</Button>
          <Button disabled className="bg-destructive/40 text-destructive-foreground">Run Calculation</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
