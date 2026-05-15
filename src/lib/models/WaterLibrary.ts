import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IWaterLibrary extends Document {
  name: string;
  description: string;
  preset: string;
  chemistry: {
    ions: Record<string, number>;
    tds: number;
    conductivity: number;
    sdi: number;
    turbidity: number;
    ph: number;
    temperature: number;
  };
  isGlobal: boolean;
  userId?: Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WaterLibrarySchema = new Schema<IWaterLibrary>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    preset: { type: String, default: 'custom' },
    chemistry: {
      ions: { type: Schema.Types.Mixed, default: {} },
      tds: { type: Number, default: 0 },
      conductivity: { type: Number, default: 0 },
      sdi: { type: Number, default: 0 },
      turbidity: { type: Number, default: 0 },
      ph: { type: Number, default: 7.0 },
      temperature: { type: Number, default: 25 },
    },
    isGlobal: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

const WaterLibrary: Model<IWaterLibrary> =
  (mongoose.models.WaterLibrary as Model<IWaterLibrary>) ||
  mongoose.model<IWaterLibrary>('WaterLibrary', WaterLibrarySchema);

export default WaterLibrary;
