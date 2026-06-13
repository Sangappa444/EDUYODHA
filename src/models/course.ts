import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  thumbnail: string; // Cloudinary URL or placeholder
  price: number;
  isPremium: boolean;
  category: string;
  createdAt: Date;
}

const CourseSchema: Schema<ICourse> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  isPremium: { type: Boolean, default: false },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export default Course;
