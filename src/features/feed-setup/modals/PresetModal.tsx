'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  FolderOpen,
  Save,
  Trash2,
  Copy,
  Search,
  Waves,
  Droplets,
  Zap,
  Info,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Mode = 'choose' | 'save';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialMode?: Mode;
}

const LIBRARY = [
  // ── Mean Regional Profiles (Meybeck / GEMS / published global averages) ──
  {
    id: 'river-na',
    name: 'River - Mean North America',
    type: 'Surface Water',
    tds: 178,
    ph: 7.8,
    sdi: 4.8,
    temp: 18,
    cations: { 'NH₄': 0.0, Na: 9.0, K: 1.4, Mg: 4.1, Ca: 16.0, Sr: 0.0, Ba: 0.0 },
    anions: { 'CO₃': 0.061, 'HCO₃': 74.822, 'NO₃': 1.0, F: 0.1, Cl: 8.0, Br: 0.0, 'SO₄': 11.0, 'PO₄': 0.0 },
    neutrals: { 'SiO₂': 9.0, B: 0.0, 'CO₂': 8.428 },
  },
  {
    id: 'river-sa',
    name: 'River - Mean South America',
    type: 'Surface Water',
    tds: 92,
    ph: 7.4,
    sdi: 4.6,
    temp: 22,
    cations: { 'NH₄': 0, Na: 4.0, K: 2.0, Mg: 1.5, Ca: 7.2, Sr: 0, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 31.0, 'NO₃': 0.4, F: 0, Cl: 4.9, Br: 0, 'SO₄': 4.8, 'PO₄': 0 },
    neutrals: { 'SiO₂': 11.9, B: 0, 'CO₂': 6.5 },
  },
  {
    id: 'river-eu',
    name: 'River - Mean Europe',
    type: 'Surface Water',
    tds: 280,
    ph: 7.9,
    sdi: 4.5,
    temp: 14,
    cations: { 'NH₄': 0, Na: 5.4, K: 1.7, Mg: 5.6, Ca: 31.1, Sr: 0, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 95.0, 'NO₃': 3.7, F: 0, Cl: 6.9, Br: 0, 'SO₄': 24.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 7.5, B: 0, 'CO₂': 7.2 },
  },
  {
    id: 'river-asia',
    name: 'River - Mean Asia',
    type: 'Surface Water',
    tds: 320,
    ph: 8.0,
    sdi: 4.6,
    temp: 24,
    cations: { 'NH₄': 0, Na: 9.3, K: 1.6, Mg: 5.6, Ca: 18.4, Sr: 0, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 79.0, 'NO₃': 0.7, F: 0, Cl: 8.7, Br: 0, 'SO₄': 8.4, 'PO₄': 0 },
    neutrals: { 'SiO₂': 11.0, B: 0, 'CO₂': 5.9 },
  },
  {
    id: 'river-africa',
    name: 'River - Mean Africa',
    type: 'Surface Water',
    tds: 121,
    ph: 7.6,
    sdi: 4.6,
    temp: 26,
    cations: { 'NH₄': 0, Na: 11.0, K: 3.9, Mg: 3.8, Ca: 12.5, Sr: 0, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 43.0, 'NO₃': 0.8, F: 0, Cl: 12.1, Br: 0, 'SO₄': 13.5, 'PO₄': 0 },
    neutrals: { 'SiO₂': 23.2, B: 0, 'CO₂': 6.0 },
  },
  {
    id: 'river-au',
    name: 'River - Mean Australia',
    type: 'Surface Water',
    tds: 75,
    ph: 7.3,
    sdi: 4.6,
    temp: 20,
    cations: { 'NH₄': 0, Na: 2.9, K: 1.4, Mg: 2.7, Ca: 3.9, Sr: 0, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 31.6, 'NO₃': 0.05, F: 0, Cl: 10.0, Br: 0, 'SO₄': 2.6, 'PO₄': 0 },
    neutrals: { 'SiO₂': 3.9, B: 0, 'CO₂': 6.0 },
  },

  // ── Well Water (USGS / Hem 1985 "Study and Interpretation of the Chemical Characteristics of Natural Water") ──
  {
    id: 'well-low-tds',
    name: 'Well Water - Low TDS',
    type: 'Well Water',
    tds: 180,
    ph: 7.3,
    sdi: 2.8,
    temp: 20,
    cations: { 'NH₄': 0, Na: 12.0, K: 2.0, Mg: 7.0, Ca: 28.0, Sr: 0.1, Ba: 0.01 },
    anions: { 'CO₃': 0, 'HCO₃': 85.0, 'NO₃': 1.0, F: 0.1, Cl: 12.0, Br: 0, 'SO₄': 15.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 10.0, B: 0.05, 'CO₂': 6.0 },
  },
  {
    id: 'well-low-hard',
    name: 'Well Water - Low Hardness',
    type: 'Well Water',
    tds: 350,
    ph: 7.4,
    sdi: 2.5,
    temp: 20,
    cations: { 'NH₄': 0, Na: 55.0, K: 3.0, Mg: 12.0, Ca: 40.0, Sr: 0.2, Ba: 0.02 },
    anions: { 'CO₃': 0, 'HCO₃': 145.0, 'NO₃': 2.0, F: 0.15, Cl: 38.0, Br: 0, 'SO₄': 42.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 15.0, B: 0.1, 'CO₂': 8.0 },
  },
  {
    id: 'well-med-hard',
    name: 'Well Water - Med Hardness',
    type: 'Well Water',
    tds: 650,
    ph: 7.6,
    sdi: 2.8,
    temp: 22,
    cations: { 'NH₄': 0, Na: 80.0, K: 5.0, Mg: 28.0, Ca: 82.0, Sr: 0.5, Ba: 0.05 },
    anions: { 'CO₃': 0, 'HCO₃': 260.0, 'NO₃': 2.5, F: 0.2, Cl: 65.0, Br: 0, 'SO₄': 90.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 20.0, B: 0.15, 'CO₂': 10.0 },
  },
  {
    id: 'well-high-hard',
    name: 'Well Water - High Hardness',
    type: 'Well Water',
    tds: 1250,
    ph: 7.8,
    sdi: 3.0,
    temp: 24,
    cations: { 'NH₄': 0, Na: 130.0, K: 8.0, Mg: 68.0, Ca: 195.0, Sr: 1.2, Ba: 0.08 },
    anions: { 'CO₃': 0, 'HCO₃': 420.0, 'NO₃': 5.0, F: 0.4, Cl: 158.0, Br: 0, 'SO₄': 225.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 28.0, B: 0.2, 'CO₂': 12.0 },
  },
  {
    // Oil-field connate water; composition from Collins (1975) "Geochemistry of Oilfield Waters"
    id: 'well-oilfield',
    name: 'Well Water - Oil Field Brine',
    type: 'Well Water',
    tds: 14500,
    ph: 7.0,
    sdi: 2.5,
    temp: 30,
    cations: { 'NH₄': 2.0, Na: 4800.0, K: 90.0, Mg: 145.0, Ca: 580.0, Sr: 22.0, Ba: 4.0 },
    anions: { 'CO₃': 0, 'HCO₃': 165.0, 'NO₃': 0, F: 0, Cl: 8200.0, Br: 25.0, 'SO₄': 450.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 14.0, B: 1.8, 'CO₂': 5.0 },
  },

  // ── Seawater (Millero 2013 / IOC-UNESCO Standard Seawater) ──
  {
    id: 'seawater-32k',
    name: 'Seawater - Salinity = 32000',
    type: 'Seawater',
    tds: 32000,
    ph: 8.1,
    sdi: 4.0,
    temp: 22,
    cations: { 'NH₄': 0, Na: 9820.0, K: 356.0, Mg: 1172.0, Ca: 374.0, Sr: 7.3, Ba: 0.045 },
    anions: { 'CO₃': 0, 'HCO₃': 129.0, 'NO₃': 0, F: 1.2, Cl: 17630.0, Br: 61.0, 'SO₄': 2460.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 3.6, B: 4.1, 'CO₂': 1.1 },
  },
  {
    id: 'seawater-std',
    name: 'Seawater - Standard Reference',
    type: 'Seawater',
    tds: 35200,
    ph: 8.1,
    sdi: 4.0,
    temp: 22,
    cations: { 'NH₄': 0, Na: 10800.0, K: 392.0, Mg: 1290.0, Ca: 412.0, Sr: 8.0, Ba: 0.05 },
    anions: { 'CO₃': 0, 'HCO₃': 142.0, 'NO₃': 0, F: 1.3, Cl: 19400.0, Br: 67.0, 'SO₄': 2710.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 4.0, B: 4.5, 'CO₂': 1.2 },
  },
  {
    // High-salinity reference (Red Sea / Arabian Gulf, ~40 g/kg salinity)
    id: 'seawater-40k',
    name: 'Seawater - Salinity = 40000',
    type: 'Seawater',
    tds: 40000,
    ph: 8.1,
    sdi: 4.0,
    temp: 28,
    cations: { 'NH₄': 0, Na: 12270.0, K: 445.0, Mg: 1465.0, Ca: 468.0, Sr: 9.1, Ba: 0.057 },
    anions: { 'CO₃': 0, 'HCO₃': 161.0, 'NO₃': 0, F: 1.5, Cl: 22040.0, Br: 76.0, 'SO₄': 3080.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 4.5, B: 5.1, 'CO₂': 1.3 },
  },

  // ── Wastewater (AWWA / WEF secondary/tertiary effluent composition) ──
  {
    id: 'wastewater-tert',
    name: 'Wastewater - Tertiary',
    type: 'Wastewater',
    tds: 655,
    ph: 7.5,
    sdi: 4.5,
    temp: 22,
    cations: { 'NH₄': 2.5, Na: 130.0, K: 14.0, Mg: 18.0, Ca: 58.0, Sr: 0.2, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 185.0, 'NO₃': 10.0, F: 0.3, Cl: 125.0, Br: 0, 'SO₄': 88.0, 'PO₄': 1.5 },
    neutrals: { 'SiO₂': 22.0, B: 0.3, 'CO₂': 5.0 },
  },

  // ── Individual Rivers (Meybeck & Ragu 1996; USGS NWIS; GEMS/Water) ──
  {
    // Amazonia softwater — Stallard & Edmond (1983), mean mainstem
    id: 'river-amazon',
    name: 'Amazon River',
    type: 'Surface Water',
    tds: 43,
    ph: 6.6,
    sdi: 4.8,
    temp: 27,
    cations: { 'NH₄': 0, Na: 1.8, K: 1.0, Mg: 1.1, Ca: 7.2, Sr: 0.05, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 19.7, 'NO₃': 0.35, F: 0, Cl: 1.9, Br: 0, 'SO₄': 3.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 7.0, B: 0, 'CO₂': 7.5 },
  },
  {
    // Columbia River at The Dalles — USGS gauge 14105700 (decadal mean)
    id: 'river-columbia',
    name: 'Columbia River',
    type: 'Surface Water',
    tds: 107,
    ph: 7.6,
    sdi: 4.5,
    temp: 14,
    cations: { 'NH₄': 0, Na: 5.6, K: 1.6, Mg: 3.6, Ca: 14.5, Sr: 0.15, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 52.0, 'NO₃': 0.7, F: 0.05, Cl: 4.3, Br: 0, 'SO₄': 10.5, 'PO₄': 0 },
    neutrals: { 'SiO₂': 14.0, B: 0, 'CO₂': 5.0 },
  },
  {
    // Colorado River at Hoover Dam — USGS; very high TDS due to evaporite geology & irrigation return
    id: 'river-colorado',
    name: 'Colorado River',
    type: 'Surface Water',
    tds: 750,
    ph: 8.1,
    sdi: 4.5,
    temp: 18,
    cations: { 'NH₄': 0, Na: 100.0, K: 4.0, Mg: 26.0, Ca: 82.0, Sr: 0.8, Ba: 0.05 },
    anions: { 'CO₃': 0, 'HCO₃': 148.0, 'NO₃': 2.5, F: 0.3, Cl: 96.0, Br: 0, 'SO₄': 280.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 11.0, B: 0.1, 'CO₂': 3.0 },
  },
  {
    // Danube at Vienna — ICPDR Transboundary Diagnostic Analysis (2004 baseline)
    id: 'river-danube',
    name: 'Danube River',
    type: 'Surface Water',
    tds: 352,
    ph: 8.0,
    sdi: 4.3,
    temp: 14,
    cations: { 'NH₄': 0.3, Na: 16.0, K: 3.5, Mg: 14.0, Ca: 48.0, Sr: 0.3, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 188.0, 'NO₃': 4.5, F: 0.15, Cl: 25.0, Br: 0, 'SO₄': 45.0, 'PO₄': 0.1 },
    neutrals: { 'SiO₂': 7.0, B: 0.05, 'CO₂': 6.0 },
  },
  {
    // Dnieper at Kremenchuk reservoir — Ukrainian monitoring data (Vyshnevsky 2000)
    id: 'river-dnepr',
    name: 'Dnepr River',
    type: 'Surface Water',
    tds: 400,
    ph: 7.8,
    sdi: 4.4,
    temp: 14,
    cations: { 'NH₄': 0.5, Na: 30.0, K: 4.0, Mg: 17.0, Ca: 52.0, Sr: 0.35, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 198.0, 'NO₃': 3.5, F: 0.1, Cl: 32.0, Br: 0, 'SO₄': 55.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 8.0, B: 0.05, 'CO₂': 6.0 },
  },
  {
    // Mackenzie near Ft. Simpson — Environment Canada NAQUADET mean
    id: 'river-mackenzie',
    name: 'Mackenzie River',
    type: 'Surface Water',
    tds: 183,
    ph: 8.0,
    sdi: 4.5,
    temp: 8,
    cations: { 'NH₄': 0, Na: 6.0, K: 1.2, Mg: 9.0, Ca: 30.0, Sr: 0.25, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 120.0, 'NO₃': 0.4, F: 0.1, Cl: 4.5, Br: 0, 'SO₄': 9.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 3.0, B: 0, 'CO₂': 4.0 },
  },
  {
    // Magdalena at Barranquilla — Restrepo & Kjerfve (2000)
    id: 'river-magdalena',
    name: 'Magdalena River',
    type: 'Surface Water',
    tds: 183,
    ph: 7.5,
    sdi: 4.8,
    temp: 26,
    cations: { 'NH₄': 0, Na: 11.0, K: 2.5, Mg: 5.5, Ca: 26.0, Sr: 0.1, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 95.0, 'NO₃': 1.2, F: 0, Cl: 9.5, Br: 0, 'SO₄': 18.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 14.0, B: 0, 'CO₂': 6.0 },
  },
  {
    // Mississippi at Baton Rouge — USGS gauge 07374000 (30-yr mean)
    id: 'river-mississippi',
    name: 'Mississippi River',
    type: 'Surface Water',
    tds: 362,
    ph: 7.9,
    sdi: 4.3,
    temp: 18,
    cations: { 'NH₄': 0.3, Na: 27.0, K: 4.0, Mg: 16.0, Ca: 52.0, Sr: 0.4, Ba: 0.05 },
    anions: { 'CO₃': 0, 'HCO₃': 148.0, 'NO₃': 4.5, F: 0.15, Cl: 33.0, Br: 0, 'SO₄': 68.0, 'PO₄': 0.1 },
    neutrals: { 'SiO₂': 8.5, B: 0.05, 'CO₂': 5.0 },
  },
  {
    // Nile at Aswan — GEMS/Water & Shahin (1985)
    id: 'river-nile',
    name: 'Nile River',
    type: 'Surface Water',
    tds: 244,
    ph: 7.8,
    sdi: 4.5,
    temp: 25,
    cations: { 'NH₄': 0.2, Na: 16.0, K: 4.0, Mg: 10.0, Ca: 31.0, Sr: 0.15, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 122.0, 'NO₃': 1.5, F: 0.1, Cl: 23.0, Br: 0, 'SO₄': 22.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 14.0, B: 0, 'CO₂': 5.0 },
  },
  {
    // Orinoco near Ciudad Bolivar — Edmond et al. (1996) softwater mean
    id: 'river-orinoco',
    name: 'Orinoco River',
    type: 'Surface Water',
    tds: 43,
    ph: 7.0,
    sdi: 4.8,
    temp: 27,
    cations: { 'NH₄': 0, Na: 2.3, K: 0.9, Mg: 1.0, Ca: 5.5, Sr: 0.04, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 19.0, 'NO₃': 0.25, F: 0, Cl: 2.2, Br: 0, 'SO₄': 2.5, 'PO₄': 0 },
    neutrals: { 'SiO₂': 9.0, B: 0, 'CO₂': 7.0 },
  },
  {
    // Po at Pontelagoscuro — ARPA Emilia-Romagna long-term dataset
    id: 'river-po',
    name: 'Po River',
    type: 'Surface Water',
    tds: 334,
    ph: 8.0,
    sdi: 4.3,
    temp: 14,
    cations: { 'NH₄': 0.4, Na: 14.5, K: 4.0, Mg: 13.0, Ca: 51.0, Sr: 0.3, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 188.0, 'NO₃': 4.5, F: 0.1, Cl: 20.0, Br: 0, 'SO₄': 32.0, 'PO₄': 0.1 },
    neutrals: { 'SiO₂': 6.5, B: 0.05, 'CO₂': 6.0 },
  },
  {
    // Rhine at Lobith (Dutch-German border) — RIWA Rijn report (2010–2020 mean)
    id: 'river-rhine',
    name: 'Rhine River',
    type: 'Surface Water',
    tds: 400,
    ph: 7.9,
    sdi: 4.2,
    temp: 13,
    cations: { 'NH₄': 0.5, Na: 42.0, K: 6.5, Mg: 11.5, Ca: 58.0, Sr: 0.5, Ba: 0.03 },
    anions: { 'CO₃': 0, 'HCO₃': 152.0, 'NO₃': 5.5, F: 0.2, Cl: 63.0, Br: 0.1, 'SO₄': 57.0, 'PO₄': 0.15 },
    neutrals: { 'SiO₂': 6.0, B: 0.08, 'CO₂': 6.0 },
  },
  {
    // Rhône at Lyon/Arles — Agence de l'Eau RMC composite mean
    id: 'river-rhone',
    name: 'Rhone River',
    type: 'Surface Water',
    tds: 302,
    ph: 8.0,
    sdi: 4.3,
    temp: 12,
    cations: { 'NH₄': 0.2, Na: 12.5, K: 2.5, Mg: 9.5, Ca: 53.0, Sr: 0.3, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 167.0, 'NO₃': 4.5, F: 0.1, Cl: 14.5, Br: 0, 'SO₄': 32.0, 'PO₄': 0.05 },
    neutrals: { 'SiO₂': 6.0, B: 0.04, 'CO₂': 5.0 },
  },
  {
    // Seine at Poses — SEDIF / AESN long-term mean (post-1990 dephosphorisation era)
    id: 'river-seine',
    name: 'Seine River',
    type: 'Surface Water',
    tds: 450,
    ph: 8.0,
    sdi: 4.3,
    temp: 12,
    cations: { 'NH₄': 0.6, Na: 32.0, K: 7.0, Mg: 11.0, Ca: 77.0, Sr: 0.5, Ba: 0.02 },
    anions: { 'CO₃': 0, 'HCO₃': 202.0, 'NO₃': 8.5, F: 0.2, Cl: 48.0, Br: 0, 'SO₄': 58.0, 'PO₄': 0.2 },
    neutrals: { 'SiO₂': 5.5, B: 0.06, 'CO₂': 7.0 },
  },
  {
    // St. Lawrence at Quebec City — Environment Canada NAQUADET (1990–2015 mean)
    id: 'river-stlawrence',
    name: 'St. Lawrence River',
    type: 'Surface Water',
    tds: 165,
    ph: 7.7,
    sdi: 4.3,
    temp: 10,
    cations: { 'NH₄': 0, Na: 5.5, K: 1.2, Mg: 6.5, Ca: 27.0, Sr: 0.2, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 97.0, 'NO₃': 1.5, F: 0.1, Cl: 8.5, Br: 0, 'SO₄': 14.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 3.8, B: 0, 'CO₂': 4.5 },
  },
  {
    // Thames at Walton-on-Thames — Thames Water / Environment Agency (2010–2020 mean)
    id: 'river-thames',
    name: 'Thames River',
    type: 'Surface Water',
    tds: 438,
    ph: 7.9,
    sdi: 4.2,
    temp: 12,
    cations: { 'NH₄': 0.5, Na: 36.0, K: 8.0, Mg: 9.5, Ca: 70.0, Sr: 0.6, Ba: 0.03 },
    anions: { 'CO₃': 0, 'HCO₃': 198.0, 'NO₃': 7.5, F: 0.35, Cl: 50.0, Br: 0.1, 'SO₄': 52.0, 'PO₄': 0.2 },
    neutrals: { 'SiO₂': 5.5, B: 0.07, 'CO₂': 6.0 },
  },
  {
    // Volga at Volgograd — GEMS/Water database, Moiseenko et al. (2013)
    id: 'river-volga',
    name: 'Volga River',
    type: 'Surface Water',
    tds: 299,
    ph: 7.7,
    sdi: 4.3,
    temp: 10,
    cations: { 'NH₄': 0.4, Na: 20.0, K: 3.5, Mg: 12.5, Ca: 45.0, Sr: 0.4, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 157.0, 'NO₃': 2.2, F: 0.1, Cl: 23.0, Br: 0, 'SO₄': 28.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 7.5, B: 0.05, 'CO₂': 5.5 },
  },

  // ── Great Lakes & Major Lakes (USGS / EPA Great Lakes National Program; GEMS/Water) ──
  {
    // Lake Erie — USGS/EPA binational long-term monitoring (western basin mean)
    id: 'lake-erie',
    name: 'Lake Erie',
    type: 'Lake',
    tds: 210,
    ph: 8.1,
    sdi: 3.5,
    temp: 15,
    cations: { 'NH₄': 0, Na: 12.5, K: 2.2, Mg: 8.5, Ca: 37.0, Sr: 0.3, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 100.0, 'NO₃': 1.5, F: 0.1, Cl: 22.5, Br: 0, 'SO₄': 24.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 1.8, B: 0, 'CO₂': 1.5 },
  },
  {
    // Lake Huron — USGS/EPA Great Lakes survey (open-lake mean)
    id: 'lake-huron',
    name: 'Lake Huron',
    type: 'Lake',
    tds: 149,
    ph: 8.1,
    sdi: 3.5,
    temp: 12,
    cations: { 'NH₄': 0, Na: 4.5, K: 1.3, Mg: 8.0, Ca: 27.0, Sr: 0.2, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 92.0, 'NO₃': 0.4, F: 0.08, Cl: 5.8, Br: 0, 'SO₄': 8.5, 'PO₄': 0 },
    neutrals: { 'SiO₂': 1.2, B: 0, 'CO₂': 1.2 },
  },
  {
    // Lake Michigan — USGS/EPA; offshore epilimnion mean
    id: 'lake-michigan',
    name: 'Lake Michigan',
    type: 'Lake',
    tds: 187,
    ph: 8.2,
    sdi: 3.5,
    temp: 10,
    cations: { 'NH₄': 0, Na: 5.5, K: 1.5, Mg: 12.0, Ca: 31.0, Sr: 0.25, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 118.0, 'NO₃': 0.5, F: 0.1, Cl: 7.2, Br: 0, 'SO₄': 9.8, 'PO₄': 0 },
    neutrals: { 'SiO₂': 1.5, B: 0, 'CO₂': 1.2 },
  },
  {
    // Lake Ontario — USGS/EPA binational monitoring (open-lake mean)
    id: 'lake-ontario',
    name: 'Lake Ontario',
    type: 'Lake',
    tds: 218,
    ph: 8.0,
    sdi: 3.5,
    temp: 12,
    cations: { 'NH₄': 0, Na: 15.0, K: 2.5, Mg: 8.5, Ca: 38.0, Sr: 0.3, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 102.0, 'NO₃': 1.8, F: 0.1, Cl: 24.0, Br: 0, 'SO₄': 24.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 1.5, B: 0, 'CO₂': 1.5 },
  },
  {
    // Lake Superior — USGS/EPA; among least-mineralized large lakes globally
    id: 'lake-superior',
    name: 'Lake Superior',
    type: 'Lake',
    tds: 73,
    ph: 7.9,
    sdi: 3.2,
    temp: 8,
    cations: { 'NH₄': 0, Na: 1.3, K: 0.6, Mg: 2.7, Ca: 13.0, Sr: 0.08, Ba: 0 },
    anions: { 'CO₃': 0, 'HCO₃': 48.0, 'NO₃': 0.15, F: 0.06, Cl: 1.2, Br: 0, 'SO₄': 3.8, 'PO₄': 0 },
    neutrals: { 'SiO₂': 2.4, B: 0, 'CO₂': 1.0 },
  },
  {
    // Lake Victoria — GEMS/Water; sodium-rich rift lake with elevated alkalinity
    id: 'lake-victoria',
    name: 'Lake Victoria',
    type: 'Lake',
    tds: 111,
    ph: 8.8,
    sdi: 3.5,
    temp: 26,
    cations: { 'NH₄': 0, Na: 11.0, K: 6.0, Mg: 3.8, Ca: 5.0, Sr: 0.06, Ba: 0 },
    anions: { 'CO₃': 2.5, 'HCO₃': 56.0, 'NO₃': 0.5, F: 0.1, Cl: 10.5, Br: 0, 'SO₄': 3.8, 'PO₄': 0 },
    neutrals: { 'SiO₂': 12.0, B: 0, 'CO₂': 0.5 },
  },
  {
    // Lake Winnipeg — Manitoba Water Stewardship monitoring (south basin mean)
    id: 'lake-winnipeg',
    name: 'Lake Winnipeg',
    type: 'Lake',
    tds: 372,
    ph: 8.3,
    sdi: 3.8,
    temp: 12,
    cations: { 'NH₄': 0.2, Na: 26.0, K: 5.0, Mg: 21.0, Ca: 54.0, Sr: 0.45, Ba: 0 },
    anions: { 'CO₃': 1.5, 'HCO₃': 188.0, 'NO₃': 1.5, F: 0.2, Cl: 21.0, Br: 0, 'SO₄': 50.0, 'PO₄': 0 },
    neutrals: { 'SiO₂': 3.2, B: 0, 'CO₂': 2.0 },
  },

  // ── Legacy custom profile ──
  {
    id: 'brackish-well',
    name: 'Brackish Well',
    type: 'Brackish',
    tds: 2400,
    ph: 7.6,
    sdi: 3.2,
    temp: 25,
    cations: { 'NH₄': 0.5, Na: 580.0, K: 12.0, Mg: 68.0, Ca: 142.0, Sr: 1.8, Ba: 0.04 },
    anions: { 'CO₃': 0, 'HCO₃': 184.0, 'NO₃': 4.2, F: 0.6, Cl: 920.0, Br: 2.1, 'SO₄': 380.0, 'PO₄': 0.1 },
    neutrals: { 'SiO₂': 18.0, B: 0.4, 'CO₂': 8.0 },
  },
];

export function PresetModal({
  open,
  onOpenChange,
  initialMode = 'choose',
}: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);
  const [selected, setSelected] = useState(LIBRARY[0].id);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('My Stream');
  const [classification, setClassification] = useState('Seawater');

  const filteredLibrary = useMemo(() => {
    return LIBRARY.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.type.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const preset = useMemo(
    () => LIBRARY.find((p) => p.id === selected) || LIBRARY[0],
    [selected],
  );

  const totals = (group: Record<string, number>) =>
    Object.values(group).reduce((a, b) => a + b, 0);

  const renderTable = (
    title: string,
    color: string,
    data: Record<string, number>,
  ) => (
    <div className='rounded-xl border border-border overflow-hidden bg-card shadow-sm'>
      <div
        className={`px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold border-b border-border/50 ${color}`}
      >
        {title}
      </div>
      <div className='grid grid-cols-2 px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/20 font-semibold border-b border-border/40'>
        <span>Symbol</span>
        <span className='text-right'>mg/L</span>
      </div>
      <div className='max-h-[180px] overflow-y-auto scrollbar-premium'>
        {Object.entries(data).map(([k, v]) => (
          <div
            key={k}
            className='grid grid-cols-2 px-4 py-2 text-[11px] font-mono border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors'
          >
            <span className='font-bold text-slate-500'>{k}</span>
            <span className='text-right text-slate-700'>{v.toFixed(3)}</span>
          </div>
        ))}
      </div>
      <div className='grid grid-cols-2 px-4 py-2 text-[11px] font-mono font-bold bg-muted/40 border-t border-border/50'>
        <span className='text-muted-foreground uppercase text-[9px] tracking-widest'>
          Total
        </span>
        <span className='text-right text-primary'>
          {totals(data).toFixed(3)}
        </span>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-6xl w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-slate-50'>
        <DialogHeader className='px-8 pt-8 pb-6 bg-white border-b border-slate-100'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-2.5'>
              <div className='w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20'>
                <FolderOpen className='w-5 h-5 text-primary' />
              </div>
              <div>
                <DialogTitle className='font-display text-2xl tracking-tight'>
                  Water Library
                </DialogTitle>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Verified engineering water profiles & compositions
                </p>
              </div>
            </div>
            <div className='bg-slate-100 rounded-xl p-1 flex gap-1 shadow-inner'>
              <button
                onClick={() => setMode('choose')}
                className={cn(
                  'px-4 py-1.5 text-xs font-bold rounded-lg transition-all',
                  mode === 'choose'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-900',
                )}
              >
                Choose Profile
              </button>
              <button
                onClick={() => setMode('save')}
                className={cn(
                  'px-4 py-1.5 text-xs font-bold rounded-lg transition-all',
                  mode === 'save'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-900',
                )}
              >
                Save Current
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className='flex h-[75vh] max-h-[600px] min-h-[400px] overflow-hidden'>
          {/* ── MODE: CHOOSE ── */}
          {mode === 'choose' && (
            <>
              {/* Left Sidebar: Library List */}
              <div className='w-80 border-r border-slate-100 bg-white flex flex-col shrink-0'>
                <div className='p-4 border-b border-slate-50'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                    <Input
                      placeholder='Search profiles...'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className='pl-9 h-10 bg-slate-50 border-transparent focus:bg-white transition-all text-sm rounded-xl'
                    />
                  </div>
                </div>
                <div className='flex-1 overflow-y-auto scrollbar-premium p-3 space-y-1'>
                  {filteredLibrary.map((p) => {
                    const Icon =
                      p.type === 'Seawater'
                        ? Waves
                        : p.type === 'Surface Water' || p.type === 'Lake'
                          ? Droplets
                          : Zap;
                    const isActive = selected === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelected(p.id)}
                        className={cn(
                          'w-full text-left p-3 rounded-xl transition-all group relative',
                          isActive
                            ? 'bg-primary/5 ring-1 ring-primary/20 shadow-sm'
                            : 'hover:bg-slate-50',
                        )}
                      >
                        <div className='flex items-center gap-3'>
                          <div
                            className={cn(
                              'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                              isActive
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200',
                            )}
                          >
                            <Icon className='w-4 h-4' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <div
                              className={cn(
                                'text-xs font-bold truncate',
                                isActive ? 'text-primary' : 'text-slate-700',
                              )}
                            >
                              {p.name}
                            </div>
                            <div className='text-[10px] text-slate-400 mt-0.5'>
                              {p.type} · {p.tds} mg/L
                            </div>
                          </div>
                          {isActive && (
                            <ChevronRight className='w-4 h-4 text-primary shrink-0' />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Pane: Details */}
              <div className='flex-1 overflow-y-auto scrollbar-premium p-8 bg-slate-50/50'>
                <div className='space-y-6'>
                  <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
                    {[
                      { label: 'Water Type', value: preset.type, icon: Info },
                      {
                        label: 'TDS',
                        value: `${preset.tds} mg/L`,
                        icon: Activity,
                      },
                      { label: 'pH', value: preset.ph.toFixed(2), icon: Zap },
                      {
                        label: 'SDI₁₅',
                        value: preset.sdi.toFixed(1),
                        icon: Waves,
                      },
                      {
                        label: 'Temp',
                        value: `${preset.temp} °C`,
                        icon: Droplets,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className='rounded-2xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow group'
                      >
                        <div className='flex items-center gap-2 mb-2'>
                          <div className='p-1 rounded-md bg-slate-50 text-slate-400 group-hover:text-primary transition-colors'>
                            <item.icon className='w-3 h-3' />
                          </div>
                          <span className='text-[9px] uppercase tracking-[0.15em] text-slate-400 font-bold'>
                            {item.label}
                          </span>
                        </div>
                        <div className='font-display font-bold text-sm text-slate-900 tracking-tight'>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
                    {renderTable(
                      'Cations',
                      'bg-blue-50/80 text-blue-600',
                      preset.cations,
                    )}
                    {renderTable(
                      'Anions',
                      'bg-orange-50/80 text-orange-600',
                      preset.anions,
                    )}
                    {renderTable(
                      'Neutrals',
                      'bg-slate-50/80 text-slate-500',
                      preset.neutrals,
                    )}
                  </div>

                  <div className='rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden'>
                    <div className='absolute top-0 right-0 p-8 opacity-5'>
                      <CheckCircle2 className='w-24 h-24 text-primary' />
                    </div>
                    <div className='flex gap-12 relative z-10'>
                      <div>
                        <div className='text-[9px] uppercase tracking-widest text-primary/60 font-black mb-1'>
                          Total Solids (TDS)
                        </div>
                        <div className='font-mono text-xl font-bold text-primary'>
                          {(
                            totals(preset.cations) +
                            totals(preset.anions) +
                            totals(preset.neutrals)
                          ).toFixed(2)}{' '}
                          <span className='text-xs'>mg/L</span>
                        </div>
                      </div>
                      <div>
                        <div className='text-[9px] uppercase tracking-widest text-primary/60 font-black mb-1'>
                          Charge Balance
                        </div>
                        <div className='font-mono text-xl font-bold text-success flex items-center gap-2'>
                          <CheckCircle2 className='w-5 h-5' /> 0.00{' '}
                          <span className='text-xs uppercase tracking-wider opacity-60'>
                            meq/L
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => onOpenChange(false)}
                      className='relative z-10 h-11 px-6 rounded-xl bg-primary text-white font-bold text-xs gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all'
                    >
                      <CheckCircle2 className='w-4 h-4' /> Use This Profile
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── MODE: SAVE ── */}
          {mode === 'save' && (
            <div className='flex-1 overflow-y-auto scrollbar-premium bg-slate-50/20 p-8'>
              <div className='max-w-6xl mx-auto space-y-6'>
                <div className='bg-white rounded-2xl border border-border p-5 flex flex-col md:flex-row items-center gap-6 shadow-sm'>
                  <div className='flex-1 space-y-1.5 w-full'>
                    <Label className='text-[10px] uppercase tracking-[0.2em] text-primary font-black ml-1'>
                      Profile Identity
                    </Label>
                    <div className='relative group'>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className='h-12 rounded-xl text-base border-border bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 font-display font-bold transition-all pl-4 pr-12'
                        placeholder='Stream identification...'
                      />
                      <Save className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300' />
                    </div>
                  </div>
                  <div className='w-full md:w-64 space-y-1.5'>
                    <Label className='text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black ml-1'>
                      Stream Classification
                    </Label>
                    <Select
                      value={classification}
                      onValueChange={setClassification}
                    >
                      <SelectTrigger className='h-12 rounded-xl border-border bg-slate-50/50 focus:bg-white font-bold text-slate-700'>
                        <SelectValue placeholder='Select classification' />
                      </SelectTrigger>
                      <SelectContent className='rounded-xl border-border'>
                        <SelectItem
                          value='Surface'
                          className='font-bold text-xs'
                        >
                          Surface Water
                        </SelectItem>
                        <SelectItem
                          value='Seawater'
                          className='font-bold text-xs'
                        >
                          Seawater
                        </SelectItem>
                        <SelectItem
                          value='Brackish'
                          className='font-bold text-xs'
                        >
                          Brackish Water
                        </SelectItem>
                        <SelectItem value='Waste' className='font-bold text-xs'>
                          Waste Water
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
                  <div className='lg:col-span-12 space-y-4'>
                    <div className='flex items-center justify-between mb-1'>
                      <div className='flex items-center gap-2'>
                        <div className='w-1 h-3 bg-primary rounded-full' />
                        <h3 className='text-[10px] font-black uppercase tracking-widest text-slate-900'>
                          Engineering Specifications (Read-Only)
                        </h3>
                      </div>
                      <Badge
                        variant='outline'
                        className='text-[9px] bg-orange-50 border-orange-100 text-orange-600 font-black px-2 py-0'
                      >
                        LOCKED TO ACTIVE STREAM
                      </Badge>
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 opacity-90'>
                      {[
                        { label: 'Turbidity', unit: 'NTU', value: '0.00' },
                        { label: 'TSS', unit: 'mg/L', value: '0.00' },
                        { label: 'TOC', unit: 'mg/L', value: '0.00' },
                        { label: 'SDI₁₅', unit: '', value: '4.0' },
                        { label: 'pH', unit: '', value: '7.00' },
                        { label: 'Min °C', unit: '', value: '10.0' },
                        {
                          label: 'Design °C',
                          unit: '',
                          value: '25.0',
                          active: true,
                        },
                        { label: 'Max °C', unit: '', value: '40.0' },
                      ].map((prop) => (
                        <div
                          key={prop.label}
                          className={cn(
                            'rounded-xl border border-border p-3 shadow-sm relative overflow-hidden transition-all',
                            prop.active
                              ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10'
                              : 'bg-white',
                          )}
                        >
                          <Label className='text-[8px] uppercase tracking-widest text-slate-400 font-black mb-1.5 block'>
                            {prop.label}
                          </Label>
                          <div className='flex items-baseline gap-1.5'>
                            <span
                              className={cn(
                                'font-mono text-xs font-bold',
                                prop.active ? 'text-primary' : 'text-slate-600',
                              )}
                            >
                              {prop.value}
                            </span>
                            {prop.unit && (
                              <span className='text-[8px] font-black text-slate-300 uppercase'>
                                {prop.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <div className='w-1 h-3 bg-primary rounded-full' />
                    <h3 className='text-[10px] font-black uppercase tracking-widest text-slate-900'>
                      Ionic Summary
                    </h3>
                  </div>
                  <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 opacity-95'>
                    {renderTable(
                      'Cations',
                      'bg-blue-50/80 text-blue-600',
                      preset.cations,
                    )}
                    {renderTable(
                      'Anions',
                      'bg-orange-50/80 text-orange-600',
                      preset.anions,
                    )}
                    {renderTable(
                      'Neutrals',
                      'bg-slate-50/80 text-slate-500',
                      preset.neutrals,
                    )}
                  </div>
                </div>

                <div className='p-6 rounded-2xl bg-slate-900 text-white shadow-lg relative overflow-hidden group border-0 mt-2'>
                  <div className='absolute top-0 right-0 p-8 opacity-5 translate-x-1/4 -translate-y-1/4'>
                    <CheckCircle2 className='w-48 h-48' />
                  </div>
                  <div className='flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10'>
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10'>
                        <Activity className='w-6 h-6 text-primary-soft' />
                      </div>
                      <div className='space-y-0.5'>
                        <h4 className='text-sm font-bold tracking-tight'>
                          Global Serialization Ready
                        </h4>
                        <p className='text-[10px] text-slate-400 leading-relaxed max-w-sm'>
                          Serialize current composition to the shared water
                          library.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => onOpenChange(false)}
                      className='h-12 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-2.5 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all'
                    >
                      <Save className='w-4 h-4' /> Commit & Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className='flex items-center justify-between gap-3 px-10 py-6 border-t border-border bg-white'>
          <div className='flex items-center gap-3'>
            {mode === 'choose' ? (
              <Button
                variant='ghost'
                className='h-12 px-5 text-[11px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5 hover:text-destructive gap-2 rounded-2xl'
              >
                <Trash2 className='w-4 h-4' /> Delete from library
              </Button>
            ) : (
              <div className='text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-xl border border-border'>
                <div className='w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]' />
                Serialization Active
              </div>
            )}
          </div>
          <div className='flex gap-4'>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='h-12 px-8 text-[11px] font-black uppercase tracking-widest text-slate-500 border-border rounded-2xl hover:bg-slate-50 transition-all hover:border-slate-300'
            >
              Cancel
            </Button>
            {mode === 'choose' && (
              <Button
                onClick={() => onOpenChange(false)}
                className='h-12 px-10 text-[11px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-slate-800 rounded-2xl gap-3 shadow-xl shadow-slate-200 transition-all active:scale-95 border-0 flex items-center'
              >
                <CheckCircle2 className='w-4 h-4' /> Use Profile
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
