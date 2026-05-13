'use client';

import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SoluteData, ScalingData } from './report-types';
import { Beaker, AlertTriangle, Thermometer } from 'lucide-react';

export function ChemicalAnalysis({ soluteData, scalingData, warnings }: { soluteData: SoluteData[]; scalingData: ScalingData[]; warnings: string[] }) {
  return (
    <div className="space-y-8">
      {/* Solute Concentrations */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground mb-4 flex items-center gap-2">
          <Beaker className="w-4 h-4 text-primary" /> RO Solute Concentrations
        </h3>
        <Card className="border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-[11px] font-bold uppercase">Ion / Parameter</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center">Raw Feed</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center">pH Adjusted</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center">Concentrate</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center">Permeate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {soluteData.map((row) => (
                <TableRow key={row.ion} className="hover:bg-primary/5 transition-colors group">
                  <TableCell className="text-xs font-semibold group-hover:text-primary transition-colors">{row.ion}</TableCell>
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">{row.rawFeed}</TableCell>
                  <TableCell className="text-center font-mono text-xs text-foreground font-medium">{row.phAdjustedFeed}</TableCell>
                  <TableCell className="text-center font-mono text-xs text-concentrate font-bold">{row.concentrate}</TableCell>
                  <TableCell className="text-center font-mono text-xs text-permeate font-bold">{row.permeate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Chemical Adjustments & Scaling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground mb-4 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-primary" /> Scaling & Solubility
          </h3>
          <Card className="border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-[11px] font-bold uppercase">Indices / Saturation</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-center">Raw</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-center text-primary">Adj.</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-center text-concentrate">Conc.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scalingData.map((row) => (
                  <TableRow key={row.parameter} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-medium">{row.parameter}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{row.beforePh}</TableCell>
                    <TableCell className="text-center font-mono text-xs font-bold text-primary">{row.afterPh}</TableCell>
                    <TableCell className="text-center font-mono text-xs font-bold text-concentrate">{row.concentrate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Solubility Warnings */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" /> Solubility Warnings
          </h3>
          <Card className="border-border p-4 bg-muted/10 h-full">
            {warnings.length > 0 ? (
              <div className="space-y-3">
                {warnings.map((w, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 bg-card border border-warning/30 rounded-lg text-xs leading-relaxed text-foreground/90 shadow-sm">
                    <div className="bg-warning/20 p-1 rounded mt-0.5">
                      <AlertTriangle className="w-3 h-3 text-warning" />
                    </div>
                    {w}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8 text-center">
                <Badge variant="outline" className="bg-success-soft text-success border-success/30 mb-2">No Risks Detected</Badge>
                <p className="text-[10px] uppercase tracking-wider font-bold">Scaling indices within safe operating limits</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
