'use client';

import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SystemOverview, PassSummary } from './report-types';
import { Activity, Droplets } from 'lucide-react';

export function SystemSummary({ overview, passes }: { overview: SystemOverview; passes: PassSummary[] }) {
  return (
    <div className="space-y-6">
      {/* Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          ['Total Units', overview.totalUnits, 'ea'],
          ['Online Units', overview.online, 'ea'],
          ['Standby Units', overview.standby, 'ea'],
          ['RO Recovery', overview.roRecovery, '%'],
          ['System Feed', overview.systemFeed, 'm³/h'],
          ['System Permeate', overview.systemPermeate, 'm³/h'],
        ].map(([l, v, u]) => (
          <Card key={l as string} className="p-4 border-border bg-card/50 hover:border-primary/30 transition-colors shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">{l}</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-display font-bold text-foreground">{v}</span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">{u}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Pass Summary Table */}
      <Card className="border-border overflow-hidden">
        <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">Pass Summary Overview</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              <TableHead className="w-[200px] text-[10px] uppercase font-bold">Parameter</TableHead>
              {passes.map((p, i) => (
                <TableHead key={i} className="text-center text-[10px] uppercase font-bold text-primary">{p.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ['Water Type', 'waterType'],
              ['Number of Elements', 'numElements'],
              ['Total Active Area (m²)', 'totalActiveArea'],
              ['Feed Flow Per Pass (m³/h)', 'feedFlow'],
              ['Feed TDS (mg/L)', 'feedTds'],
              ['Feed Pressure (bar)', 'feedPressure'],
              ['Flow Factor Per Stage', 'flowFactor'],
            ].map(([label, key]) => (
              <TableRow key={key} className="hover:bg-primary/5 transition-colors">
                <TableCell className="font-medium text-xs py-2">{label}</TableCell>
                {passes.map((p, i) => (
                  <TableCell key={i} className="text-center font-mono text-xs py-2 text-foreground">
                    {p[key as keyof PassSummary]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Permeate Flow Table */}
      <Card className="border-border overflow-hidden">
        <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center gap-2">
          <Droplets className="w-4 h-4 text-permeate" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">Permeate Quality & Energy</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              <TableHead className="w-[200px] text-[10px] uppercase font-bold">Parameter</TableHead>
              {passes.map((p, i) => (
                <TableHead key={i} className="text-center text-[10px] uppercase font-bold text-permeate">{p.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ['Permeate Flow Per Pass (m³/h)', 'permeateFlow'],
              ['Pass Average Flux (LMH)', 'avgFlux'],
              ['Permeate TDS (mg/L)', 'permeateTds'],
              ['Pass Net Recovery (%)', 'netRecovery'],
              ['Average NDP (bar)', 'avgNdp'],
              ['Specific Energy (kWh/m³)', 'specificEnergy'],
              ['Temperature (°C)', 'temp'],
              ['pH', 'pH'],
              ['Chemical Dose', 'chemicalDose'],
            ].map(([label, key]) => (
              <TableRow key={key} className="hover:bg-permeate/5 transition-colors">
                <TableCell className="font-medium text-xs py-2">{label}</TableCell>
                {passes.map((p, i) => (
                  <TableCell key={i} className="text-center font-mono text-xs py-2 text-foreground">
                    {p[key as keyof PassSummary] ?? '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
