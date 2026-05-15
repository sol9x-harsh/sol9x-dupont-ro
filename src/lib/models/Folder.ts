import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IFolder extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<IFolder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    color: { type: String },
  },
  { timestamps: true }
);

// Ensure name is unique per user
FolderSchema.index({ userId: 1, name: 1 }, { unique: true });

const Folder: Model<IFolder> =
  (mongoose.models.Folder as Model<IFolder>) ||
  mongoose.model<IFolder>('Folder', FolderSchema);

export default Folder;
