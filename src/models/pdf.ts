import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPdf extends Document {
  title: string;
  description: string;
  url: string; // Cloudinary URL
  category: 'vtu-notes' | 'kcet-materials' | 'other';
  semester?: number; // For VTU updates filtering
  price: number;
  isPremium: boolean;
  createdAt: Date;
}

const PdfSchema: Schema<IPdf> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  category: { type: String, enum: ['vtu-notes', 'kcet-materials', 'other'], default: 'other' },
  semester: { type: Number },
  price: { type: Number, required: true, default: 0 },
  isPremium: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Pdf: Model<IPdf> = mongoose.models.Pdf || mongoose.model<IPdf>('Pdf', PdfSchema);
export default Pdf;
