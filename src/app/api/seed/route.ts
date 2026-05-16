import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Project from '@/lib/models/Project';
import WaterLibrary from '@/lib/models/WaterLibrary';

const DEMO_EMAIL = 'demo@transfilm.com';
const DEMO_PASSWORD = 'demo1234';
const DEMO_NAME = 'Demo Engineer';

// Chennai SWRO seawater chemistry (35 000 mg/L TDS)
const DEMO_FEED_CHEMISTRY = {
  ions: {
    ammonium: 0, sodium: 10800, potassium: 380, magnesium: 1290,
    calcium: 410, strontium: 8, barium: 0.05, carbonate: 0,
    bicarbonate: 140, nitrate: 0, fluoride: 1.3, chloride: 19400,
    bromide: 0, sulfate: 2700, phosphate: 0, silica: 2, boron: 5, co2: 0,
  },
  tds: 35000,
  conductivity: 53000,
  sdi: 2.5,
  turbidity: 0.08,
  ph: 8.1,
  temperature: 28,
};

function makeVessels(passIdx: number, stageIdx: number, count: number, els: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${passIdx + 1}-s${stageIdx + 1}-v${i + 1}`,
    label: `V${i + 1}`,
    elementsPerVessel: els,
    membraneModel: 'SW30HRLE-400i',
  }));
}

const DEMO_PASSES = [
  {
    id: 'pass-1',
    label: 'Pass 1',
    recovery: 42,
    stages: [
      { id: 'stage-1', label: 'Stage 1', vessels: makeVessels(0, 0, 42, 7), pressureDropBar: undefined },
      { id: 'stage-2', label: 'Stage 2', vessels: makeVessels(0, 1, 21, 7), pressureDropBar: undefined },
    ],
  },
];

// GET /api/seed — idempotent demo data seeder
export async function GET() {
  await connectDB();

  // ── Demo User ──────────────────────────────────────────────────────────────
  let user = await User.findOne({ email: DEMO_EMAIL }).lean();

  if (!user) {
    const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);
    const created = await User.create({ email: DEMO_EMAIL, name: DEMO_NAME, password: hashed });
    user = created.toObject();
  }

  const userId = user._id;

  // ── Demo Project ───────────────────────────────────────────────────────────
  let project = await Project.findOne({ userId, name: 'Chennai SWRO Plant — Demo' }).lean();

  if (!project) {
    const created = await Project.create({
      userId,
      projectNo: 'PRJ-2026-001',
      folder: 'Demo Projects',
      hot: true,
      name: 'Chennai SWRO Plant — Demo',
      client: 'Transfilm Demo Client',
      location: 'Chennai, Tamil Nadu, India',
      description: 'Seawater RO desalination — 250 m³/h feed — SW30HRLE-400i',
      status: 'active',
      recovery: 42,
      notes: 'Demo project — pre-seeded with full SWRO configuration for immediate testing.',

      feed: {
        preset: 'seawater',
        streamLabel: 'Stream 01',
        chemistry: DEMO_FEED_CHEMISTRY,
      },

      roConfig: {
        passes: DEMO_PASSES,
        feedFlow: 250,
        systemRecovery: 42,
        feedPressureBar: 55.4,
        permeatePressureBar: 0,
        chemicalAdjustment: {
          phDownOn: false, phDownChemical: 'HCl(32)', phDownTargetPh: 6.5,
          degasOn: false, degasMode: 'CO2 Concentration', degasValue: 10,
          phUpOn: false, phUpChemical: 'NaOH(50)', phUpTargetPh: 8.0,
          antiScalantOn: true, antiScalantChemical: 'Na6P6O18(100)', antiScalantDose: 2.0,
          dechlorinatorOn: false, dechlorinatorChemical: 'NaHSO3', dechlorinatorDose: 1.0,
        },
      },

      report: {
        selectedSections: ['project-summary', 'feed-analysis', 'system-design', 'performance-table', 'chemical-analysis'],
        climateMode: 'standard',
        exportSettings: { format: 'pdf', includeCharts: true, includePFD: true, includeRawData: false },
      },
    });
    project = created.toObject();
  }

  // ── Demo Water Library ─────────────────────────────────────────────────────
  let library = await WaterLibrary.findOne({ name: 'Arabian Gulf Seawater' }).lean();

  if (!library) {
    await WaterLibrary.create({
      name: 'Arabian Gulf Seawater',
      description: 'Typical Arabian Gulf seawater composition — high temperature, high TDS, elevated boron',
      preset: 'seawater',
      isGlobal: true,
      tags: ['seawater', 'gulf', 'swro', 'high-temp'],
      chemistry: {
        ions: {
          ammonium: 0, sodium: 11200, potassium: 420, magnesium: 1400,
          calcium: 480, strontium: 9, barium: 0, carbonate: 0,
          bicarbonate: 120, nitrate: 0, fluoride: 1.4, chloride: 20000,
          bromide: 0, sulfate: 3000, phosphate: 0, silica: 1, boron: 6, co2: 0,
        },
        tds: 42000,
        conductivity: 62000,
        sdi: 3.0,
        turbidity: 0.1,
        ph: 8.0,
        temperature: 33,
      },
    });
  }

  return NextResponse.json({
    success: true,
    demo: {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      projectId: project._id.toString(),
    },
    message: 'Demo data seeded successfully. Use the credentials above to log in.',
  });
}
