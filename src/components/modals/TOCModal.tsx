'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Beaker } from "lucide-react";

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

export function TOCModal({ open, onOpenChange }: Props) {
  const [rej, setRej] = useState(96);
  const feedTOC = 1.8;
  const valid = rej >= 0 && rej <= 100;
  const permTOC = (feedTOC * (1 - rej / 100)).toFixed(3);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary-soft text-primary border-primary/30">Engineering Utility</Badge>
            <Badge variant="outline" className="font-mono text-[10px]">§16.7</Badge>
          </div>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Beaker className="w-5 h-5 text-primary" /> TOC Rejection
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Specify membrane TOC rejection used in permeate quality estimation.</p>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Rejection</span>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={rej}
                  onChange={(e) => setRej(Number(e.target.value))}
                  className="h-9 w-20 font-mono text-right"
                />
                <span className="text-xs text-muted-foreground font-mono">%</span>
              </div>
            </div>
            <Slider value={[rej]} onValueChange={(v) => setRej(v[0])} min={0} max={100} step={0.5} />
            {!valid && <div className="text-[11px] text-destructive mt-1.5">Value must be between 0 and 100%.</div>}
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Feed TOC</span>
              <span className="font-mono font-semibold">{feedTOC} mg/L</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Rejection applied</span>
              <span className="font-mono font-semibold">{rej.toFixed(1)}%</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground font-semibold">Estimated Permeate TOC</span>
              <span className="font-mono font-semibold text-primary">{permTOC} mg/L</span>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground italic">
            Affects permeate TOC estimation only. Does not influence ion transport, osmotic pressure, or flux calculations.
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!valid} onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
            Apply Rejection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
