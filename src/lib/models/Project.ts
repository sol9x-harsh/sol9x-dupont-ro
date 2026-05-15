import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ── Subdocument schemas ────────────────────────────────────────────────────────

const VesselSchema = new Schema(
  {
    id: String,
    label: String,
    elementsPerVessel: Number,
    membraneModel: String,
  },
  { _id: false },
);

const StageSchema = new Schema(
  {
    id: String,
    label: String,
    vessels: [VesselSchema],
    pressureDropBar: Number,
  },
  { _id: false },
);

const PassSchema = new Schema(
  {
    id: String,
    label: String,
    stages: [StageSchema],
    recovery: Number,
  },
  { _id: false },
);

const ChemicalAdjustmentSchema = new Schema(
  {
    phDownOn: { type: Boolean, default: false },
    phDownChemical: { type: String, default: 'HCl(32)' },
    phDownTargetPh: { type: Number, default: 6.5 },
    degasOn: { type: Boolean, default: false },
    degasMode: { type: String, default: 'CO2 Concentration' },
    degasValue: { type: Number, default: 10 },
    phUpOn: { type: Boolean, default: false },
    phUpChemical: { type: String, default: 'NaOH(50)' },
    phUpTargetPh: { type: Number, default: 8.0 },
    antiScalantOn: { type: Boolean, default: false },
    antiScalantChemical: { type: String, default: 'Na6P6O18(100)' },
    antiScalantDose: { type: Number, default: 2.0 },
    dechlorinatorOn: { type: Boolean, default: false },
    dechlorinatorChemical: { type: String, default: 'NaHSO3' },
    dechlorinatorDose: { type: Number, default: 1.0 },
  },
  { _id: false },
);

const IonCompositionSchema = new Schema(
  {
    ammonium: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    potassium: { type: Number, default: 0 },
    magnesium: { type: Number, default: 0 },
    calcium: { type: Number, default: 0 },
    strontium: { type: Number, default: 0 },
    barium: { type: Number, default: 0 },
    carbonate: { type: Number, default: 0 },
    bicarbonate: { type: Number, default: 0 },
    nitrate: { type: Number, default: 0 },
    fluoride: { type: Number, default: 0 },
    chloride: { type: Number, default: 0 },
    bromide: { type: Number, default: 0 },
    sulfate: { type: Number, default: 0 },
    phosphate: { type: Number, default: 0 },
    silica: { type: Number, default: 0 },
    boron: { type: Number, default: 0 },
    co2: { type: Number, default: 0 },
  },
  { _id: false },
);

const FeedChemistrySchema = new Schema(
  {
    ions: { type: IonCompositionSchema, default: () => ({}) },
    tds: { type: Number, default: 0 },
    conductivity: { type: Number, default: 0 },
    sdi: { type: Number, default: 0 },
    turbidity: { type: Number, default: 0 },
    ph: { type: Number, default: 7.0 },
    temperature:       { type: Number, default: 25 }, // legacy compat — do not remove
    designTemperature: { type: Number, default: 25 },
    minTemperature:    { type: Number, default: 21 },
    maxTemperature:    { type: Number, default: 30 },
  },
  { _id: false },
);

// ── Main document interface ────────────────────────────────────────────────────

export interface IProject extends Document {
  userId: Types.ObjectId;

  // Dashboard fields
  projectNo: string;
  folder: string;
  hot: boolean;

  // ProjectMetadata fields (from project-store)
  name: string;
  client: string;
  location: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  recovery: number;
  notes: string;

  // New fields
  designer: string;
  company: string;
  currency: string;
  exchangeRate: number;
  unitSystem: 'US' | 'METRIC' | 'USER';
  userUnits: Record<string, 'US' | 'METRIC'>;

  // Feed store state
  feed: {
    preset: string;
    waterType: string;
    streamLabel: string;
    chemistry: Record<string, unknown>;
    streams?: Record<string, unknown>;
    activeStreamId?: string;
  };

  // RO config store state
  roConfig: {
    passes: Record<string, unknown>[];
    feedFlow: number;
    systemRecovery: number;
    feedPressureBar: number;
    permeatePressureBar: number;
    chemicalAdjustment: Record<string, unknown>;
  };

  // Report store state
  report: {
    selectedSections: string[];
    climateMode: string;
    exportSettings: Record<string, unknown>;
  };

  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    projectNo: { type: String, default: '' },
    folder: { type: String, default: '' },
    hot: { type: Boolean, default: false },

    name: { type: String, required: true, trim: true },
    client: { type: String, default: '' },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'archived'],
      default: 'draft',
    },
    recovery: { type: Number, default: 0 },
    notes: { type: String, default: '' },

    // New Fields
    designer: { type: String, default: '' },
    company: { type: String, default: '' },
    currency: { type: String, default: 'USD ($)' },
    exchangeRate: { type: Number, default: 1 },
    unitSystem: { type: String, enum: ['US', 'METRIC', 'USER'], default: 'METRIC' },
    userUnits: { type: Schema.Types.Mixed, default: {} },

    feed: {
      preset: { type: String, default: 'custom' },
      waterType: { type: String, default: 'Custom' }, // WaterType — backward compat default
      streamLabel: { type: String, default: 'Stream 01' },
      chemistry: { type: FeedChemistrySchema, default: () => ({}) },
      streams: { type: Schema.Types.Mixed, default: {} },
      activeStreamId: { type: String, default: 'stream-01' },
    },

    roConfig: {
      passes: { type: [PassSchema], default: [] },
      feedFlow: { type: Number, default: 0 },
      systemRecovery: { type: Number, default: 75 },
      feedPressureBar: { type: Number, default: 10 },
      permeatePressureBar: { type: Number, default: 0 },
      chemicalAdjustment: { type: ChemicalAdjustmentSchema, default: () => ({}) },
    },

    report: {
      selectedSections: {
        type: [String],
        default: ['project-summary', 'feed-analysis', 'system-design', 'performance-table'],
      },
      climateMode: { type: String, default: 'standard' },
      exportSettings: {
        type: Schema.Types.Mixed,
        default: { format: 'pdf', includeCharts: true, includePFD: true, includeRawData: false },
      },
    },
  },
  { timestamps: true },
);

const Project: Model<IProject> =
  (mongoose.models.Project as Model<IProject>) ||
  mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
