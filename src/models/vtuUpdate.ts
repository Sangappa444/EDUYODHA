import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVtuUpdate extends Document {
  title: string;
  content: string;
  category: 'results' | 'notifications' | 'circulars';
  semester?: number; // Optional semester filter
  attachmentUrl?: string; // Optional download file
  createdAt: Date;
}

const VtuUpdateSchema: Schema<IVtuUpdate> = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['results', 'notifications', 'circulars'], default: 'notifications' },
  semester: { type: Number },
  attachmentUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const VtuUpdate: Model<IVtuUpdate> = mongoose.models.VtuUpdate || mongoose.model<IVtuUpdate>('VtuUpdate', VtuUpdateSchema);
export default VtuUpdate;
