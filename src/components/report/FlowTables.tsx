'use client';

import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StreamData, StageFlowData, ElementFlowData } from './report-types';
import { Layers, Info } from 'lucide-react';

export function FlowTables({ streams, pass1Stages, pass1Elements }: { streams: StreamData[]; pass1Stages: StageFlowData[]; pass1Elements: ElementFlowData[] }) {
  return (
    <div className="space-y-8">
      {/* 1. Main Streams Table */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" /> Main Design Streams
        </h3>
        <Card className="border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-12 text-[11px] font-bold uppercase">#</TableHead>
                <TableHead className="text-[11px] font-bold uppercase">Streams</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-right">Flow (m³/h)</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-right">TD Solids (mg/L)</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-right">Pressure (bar)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {streams.map((s) => (
                <TableRow key={s.id} className="hover:bg-primary/5 transition-colors group">
                  <TableCell className="font-mono text-[10px] text-muted-foreground">{s.id}</TableCell>
                  <TableCell className="text-xs font-semibold group-hover:text-primary transition-colors">{s.name}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{s.flow.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{Math.round(s.tds).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{s.pressure.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* 2. Pass 1 Stage Flow Table */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" /> Pass 1: Stage Performance Details
        </h3>
        <Card className="border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-[11px] font-bold uppercase text-center border-r border-border">Stg</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center">Els</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center">#PV</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center border-r border-border">E/PV</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center bg-feed/5">Feed Flow</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center bg-feed/5 border-r border-border">Feed Press</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center bg-concentrate/5">Conc Flow</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center bg-concentrate/5 border-r border-border">Conc Press</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center bg-permeate/5">Perm Flow</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center bg-permeate/5">Avg Flux</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center bg-permeate/5">Perm TDS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pass1Stages.map((stg) => (
                <TableRow key={stg.stage} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-center font-bold text-xs border-r border-border">{stg.stage}</TableCell>
                  <TableCell className="text-center text-[11px]">{stg.elements}</TableCell>
                  <TableCell className="text-center text-[11px]">{stg.pv}</TableCell>
                  <TableCell className="text-center text-[11px] border-r border-border">{stg.elsPerPv}</TableCell>
                  <TableCell className="text-center font-mono text-[11px]">{stg.feedFlow.toFixed(1)}</TableCell>
                  <TableCell className="text-center font-mono text-[11px] border-r border-border">{stg.feedPress.toFixed(1)}</TableCell>
                  <TableCell className="text-center font-mono text-[11px]">{stg.concFlow.toFixed(1)}</TableCell>
                  <TableCell className="text-center font-mono text-[11px] border-r border-border">{stg.concPress.toFixed(1)}</TableCell>
                  <TableCell className="text-center font-mono text-[11px] text-permeate font-bold">{stg.permFlow.toFixed(1)}</TableCell>
                  <TableCell className="text-center font-mono text-[11px]">{stg.avgFlux.toFixed(1)}</TableCell>
                  <TableCell className="text-center font-mono text-[11px] text-permeate">{Math.round(stg.permTds)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* 3. Pass 1 Element Flow Table */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground mb-4">
          Pass 1: Detailed Element Summary
        </h3>
        <Card className="border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-[11px] font-bold uppercase">Element Name</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center">Rec (%)</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center">Feed Flow</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center">Feed Press</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center">Conc Flow</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center">Perm Flow</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center">Perm Flux</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-center">Perm TDS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pass1Elements.map((el, i) => (
                <TableRow key={i} className="hover:bg-muted/30 transition-colors odd:bg-muted/10">
                  <TableCell className="text-xs font-bold text-primary">{el.name}</TableCell>
                  <TableCell className="text-center font-mono text-[11px]">{el.recovery.toFixed(1)}</TableCell>
                  <TableCell className="text-center font-mono text-[11px]">{el.feedFlow.toFixed(2)}</TableCell>
                  <TableCell className="text-center font-mono text-[11px]">{el.feedPress.toFixed(1)}</TableCell>
                  <TableCell className="text-center font-mono text-[11px]">{el.concFlow.toFixed(2)}</TableCell>
                  <TableCell className="text-center font-mono text-[11px] text-permeate font-bold">{el.permFlow.toFixed(2)}</TableCell>
                  <TableCell className="text-center font-mono text-[11px]">{el.permFlux.toFixed(1)}</TableCell>
                  <TableCell className="text-center font-mono text-[11px] text-permeate">{Math.round(el.permTds)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
