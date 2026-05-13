'use client';

import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CostData, EnergyCostData, ChemicalCostData } from './report-types';
import { Wallet, Zap, FlaskConical } from 'lucide-react';

export function CostBreakdown({ waterCosts, energyCosts, chemicalCosts }: { waterCosts: CostData[]; energyCosts: EnergyCostData[]; chemicalCosts: ChemicalCostData[] }) {
  return (
    <div className="space-y-8">
      {/* 1. Water & Disposal Costs */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground mb-4 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" /> Service & Waste Water Disposal
        </h3>
        <Card className="border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-[11px] font-bold uppercase">Item</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-right">Flow (m³/h)</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-right">Unit Cost ($/m³)</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-right">Daily ($)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waterCosts.map((c) => (
                <TableRow key={c.category} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-semibold">{c.category}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{c.flowRate.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{c.unitCost.toFixed(3)}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-primary">{c.dailyCost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Electricity Costs */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-warning" /> Energy Breakdown
          </h3>
          <Card className="border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-[11px] font-bold uppercase">Item</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-right">Power (kW)</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-right">Energy (kWh)</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-right">Cost ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {energyCosts.map((e) => (
                  <TableRow key={e.item} className="hover:bg-muted/30">
                    <TableCell className="text-[11px] font-medium leading-tight">
                      {e.item}
                      {e.specificEnergy && <div className="text-[9px] text-muted-foreground font-mono mt-0.5">{e.specificEnergy.toFixed(3)} kWh/m³</div>}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{e.peakPower.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{e.energy.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-foreground">{e.cost.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* 3. Chemical Costs */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground mb-4 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-permeate" /> Chemical Dosing Costs
          </h3>
          <Card className="border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-[11px] font-bold uppercase">Item</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-right">Dose (mg/L)</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-right">Vol (L/h)</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-right">Cost ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chemicalCosts.map((c) => (
                  <TableRow key={c.item} className="hover:bg-muted/30">
                    <TableCell className="text-[11px] font-medium leading-tight">
                      {c.item}
                      <div className="text-[9px] text-muted-foreground font-mono mt-0.5">${c.unitCost.toFixed(2)}/kg</div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{c.dose.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{c.volume.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-foreground">{c.cost.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
