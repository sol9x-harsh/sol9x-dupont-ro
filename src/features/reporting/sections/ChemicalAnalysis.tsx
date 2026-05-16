'use client';

import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Beaker, AlertTriangle, Thermometer, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SoluteData, ScalingData } from '@/features/reporting/types/report-types';
import type { ChemistryAdjustmentResult } from '@/core/chemistry/adjustment/chemical-adjustment';
import type { ChemicalAdjustment } from '@/store/ro-config-store';

interface ChemicalAnalysisProps {
  soluteData: SoluteData[];
  scalingData: ScalingData[];
  warnings: string[];
  adjustmentResult?: ChemistryAdjustmentResult;
  cf?: number;
  temperatureC?: number;
  temperatureLabel?: string;
  chemAdj?: ChemicalAdjustment;
}

function fmt(v: number, d = 2): string {
  return Number.isFinite(v) ? v.toFixed(d) : '—';
}

function scalingBadge(val: string): { color: string; text: string } {
  const n = parseFloat(val);
  if (!Number.isFinite(n)) return { color: '', text: '' };
  if (n > 0.5)  return { color: 'text-red-600 font-bold', text: ' ▲' };
  if (n > 0)    return { color: 'text-amber-500 font-semibold', text: ' !' };
  return { color: 'text-emerald-600', text: '' };
}

export function ChemicalAnalysis({
  soluteData,
  scalingData,
  warnings,
  adjustmentResult: adj,
  cf = 1,
  temperatureC = 25,
  temperatureLabel = 'Design — 25.0 °C',
  chemAdj,
}: ChemicalAnalysisProps) {

  // Whether each treatment step is active
  const phDownOn      = chemAdj?.phDownOn      ?? false;
  const degasOn       = chemAdj?.degasOn       ?? false;
  const phUpOn        = chemAdj?.phUpOn        ?? false;
  const antiscalantOn = chemAdj?.antiScalantOn ?? false;
  const dechlorOn     = chemAdj?.dechlorinatorOn ?? false;
  const anyDosing     = phDownOn || degasOn || phUpOn || antiscalantOn || dechlorOn;

  // Live scaling rows derived from liveAdjustmentResult when available.
  // These are always current regardless of whether simulation has run.
  const liveScalingRows = adj ? [
    {
      parameter: 'pH',
      b:  fmt(adj.beforeAdjustment.ph),
      ac: fmt(adj.afterAcid.ph),
      ad: fmt(adj.afterDegas.ph),
      r:  fmt(adj.final.ph),
      conc: fmt(adj.final.ph + 0.3 * Math.log10(Math.max(cf, 1))),
    },
    {
      parameter: 'LSI',
      b:  fmt(adj.beforeAdjustment.lsi),
      ac: fmt(adj.afterAcid.lsi),
      ad: fmt(adj.afterDegas.lsi),
      r:  fmt(adj.final.lsi),
      conc: fmt(adj.final.lsi + Math.log10(Math.max(cf, 1))),
    },
    {
      parameter: 'S&DSI',
      b:  fmt(adj.beforeAdjustment.sdi),
      ac: fmt(adj.afterAcid.sdi),
      ad: fmt(adj.afterDegas.sdi),
      r:  fmt(adj.final.sdi),
      conc: fmt(adj.final.sdi + Math.log10(Math.max(cf, 1))),
    },
    {
      parameter: 'TDS (mg/L)',
      b:  fmt(adj.beforeAdjustment.tds, 1),
      ac: fmt(adj.afterAcid.tds, 1),
      ad: fmt(adj.afterDegas.tds, 1),
      r:  fmt(adj.final.tds, 1),
      conc: fmt(adj.final.tds * cf, 1),
    },
    {
      parameter: 'HCO₃⁻ (mg/L)',
      b:  fmt(adj.beforeAdjustment.ions.bicarbonate),
      ac: fmt(adj.afterAcid.ions.bicarbonate),
      ad: fmt(adj.afterDegas.ions.bicarbonate),
      r:  fmt(adj.final.ions.bicarbonate),
      conc: fmt(adj.final.ions.bicarbonate * cf),
    },
    {
      parameter: 'CO₂ (mg/L)',
      b:  fmt(adj.beforeAdjustment.ions.co2),
      ac: fmt(adj.afterAcid.ions.co2),
      ad: fmt(adj.afterDegas.ions.co2),
      r:  fmt(adj.final.ions.co2),
      conc: fmt(adj.final.ions.co2),
    },
    {
      parameter: 'CO₃²⁻ (mg/L)',
      b:  fmt(adj.beforeAdjustment.ions.carbonate),
      ac: fmt(adj.afterAcid.ions.carbonate),
      ad: fmt(adj.afterDegas.ions.carbonate),
      r:  fmt(adj.final.ions.carbonate),
      conc: fmt(adj.final.ions.carbonate * cf),
    },
  ] : null;

  return (
    <div className="space-y-8">

      {/* ── Pretreatment Chemical Dosing Table ────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground mb-1 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-primary" /> Pretreatment Chemical Dosing
        </h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 border border-primary/20 rounded-md">
            <Thermometer className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary font-mono">{temperatureLabel}</span>
          </div>
          {anyDosing ? (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
              Active Pretreatment
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              No Dosing Applied
            </Badge>
          )}
        </div>

        {/* Dosing summary chips */}
        {anyDosing && chemAdj && adj && (
          <div className="flex flex-wrap gap-2 mb-4">
            {phDownOn && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                <span className="font-bold text-amber-700">↓ pH</span>
                <span className="text-amber-600">{chemAdj.phDownChemical}</span>
                <span className="font-mono text-amber-700">{fmt(adj.acidDoseMgL, 1)} mg/L</span>
                <span className="text-amber-500">→ pH {fmt(chemAdj.phDownTargetPh)}</span>
              </div>
            )}
            {degasOn && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg text-xs">
                <span className="font-bold text-sky-700">Degas</span>
                <span className="text-sky-600">{chemAdj.degasMode}</span>
                <span className="font-mono text-sky-700">{fmt(chemAdj.degasValue, 1)} {chemAdj.degasMode === 'CO2 % Removal' ? '%' : chemAdj.degasMode === 'CO2 Partial Pressure' ? 'µatm' : 'mg/L'}</span>
              </div>
            )}
            {phUpOn && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                <span className="font-bold text-emerald-700">↑ pH</span>
                <span className="text-emerald-600">{chemAdj.phUpChemical}</span>
                <span className="font-mono text-emerald-700">{fmt(adj.baseDoseMgL, 1)} mg/L</span>
                <span className="text-emerald-500">→ pH {fmt(chemAdj.phUpTargetPh)}</span>
              </div>
            )}
            {antiscalantOn && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-lg text-xs">
                <span className="font-bold text-violet-700">Antiscalant</span>
                <span className="text-violet-600">{chemAdj.antiScalantChemical}</span>
                <span className="font-mono text-violet-700">{fmt(chemAdj.antiScalantDose, 1)} mg/L</span>
              </div>
            )}
            {dechlorOn && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="font-bold text-slate-700">Dechlorinator</span>
                <span className="text-slate-600">{chemAdj.dechlorinatorChemical}</span>
                <span className="font-mono text-slate-700">{fmt(adj.dechlorinatorDoseMgL, 1)} mg/L</span>
              </div>
            )}
          </div>
        )}

        {/* Chemistry cascade table */}
        {liveScalingRows ? (
          <Card className="border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-[11px] font-bold uppercase w-[22%]">Parameter</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-center">Feed (Raw)</TableHead>
                  {phDownOn && (
                    <TableHead className="text-[11px] font-bold uppercase text-center text-amber-600">After Acid</TableHead>
                  )}
                  {degasOn && (
                    <TableHead className="text-[11px] font-bold uppercase text-center text-primary">After Degas</TableHead>
                  )}
                  {phUpOn && (
                    <TableHead className="text-[11px] font-bold uppercase text-center text-emerald-600">After Base</TableHead>
                  )}
                  <TableHead className="text-[11px] font-bold uppercase text-center">Feed to RO</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-center text-concentrate">Concentrate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveScalingRows.map((row) => {
                  const isScaling = row.parameter === 'LSI' || row.parameter === 'S&DSI';
                  const concStyle = isScaling ? scalingBadge(row.conc) : null;
                  return (
                    <TableRow key={row.parameter} className="hover:bg-muted/20">
                      <TableCell className="text-xs font-semibold">{row.parameter}</TableCell>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">{row.b}</TableCell>
                      {phDownOn && (
                        <TableCell className={cn("text-center font-mono text-xs font-semibold text-amber-600",
                          isScaling && parseFloat(row.ac) > 0 ? 'text-red-600' : '')}>{row.ac}</TableCell>
                      )}
                      {degasOn && (
                        <TableCell className={cn("text-center font-mono text-xs font-semibold text-primary",
                          isScaling && parseFloat(row.ad) > 0 ? 'text-red-600' : '')}>{row.ad}</TableCell>
                      )}
                      {phUpOn && (
                        <TableCell className={cn("text-center font-mono text-xs font-semibold text-emerald-600",
                          isScaling && parseFloat(row.r) > 0 ? 'text-red-600' : '')}>{row.r}</TableCell>
                      )}
                      <TableCell className="text-center font-mono text-xs font-bold">{row.r}</TableCell>
                      <TableCell className={cn("text-center font-mono text-xs font-bold", concStyle?.color)}>
                        {row.conc}{concStyle?.text}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card className="border-border p-6 bg-muted/10 text-center text-xs text-muted-foreground">
            Enter feed chemistry in Feed Setup to see pretreatment calculations.
          </Card>
        )}
      </div>

      {/* ── RO Solute Concentrations (from simulation) ─────────────────────────── */}
      {soluteData.length > 0 && (
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
                  <TableHead className="text-[11px] font-bold uppercase text-center text-concentrate">Concentrate</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-center text-permeate">Permeate</TableHead>
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
      )}

      {/* ── Scaling saturation from simulation + solubility warnings ───────────── */}
      {(scalingData.length > 0 || warnings.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scalingData.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground mb-4 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-primary" /> Saturation Analysis
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
          )}

          {warnings.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" /> Solubility Warnings
              </h3>
              <Card className="border-border p-4 bg-muted/10 h-full">
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
              </Card>
            </div>
          )}

          {warnings.length === 0 && scalingData.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" /> Solubility Warnings
              </h3>
              <Card className="border-border p-4 bg-muted/10 h-full">
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8 text-center">
                  <Badge variant="outline" className="bg-success-soft text-success border-success/30 mb-2">No Risks Detected</Badge>
                  <p className="text-[10px] uppercase tracking-wider font-bold">Scaling indices within safe operating limits</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
