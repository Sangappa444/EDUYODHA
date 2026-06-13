import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  youtubeId: string;
  courseId: mongoose.Types.ObjectId;
  description?: string;
  isPremium: boolean;
  category: string;
  createdAt: Date;
}

const VideoSchema: Schema<IVideo> = new Schema({
  title: { type: String, required: true },
  youtubeId: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  description: { type: String },
  isPremium: { type: Boolean, default: false },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Video: Model<IVideo> = mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);
export default Video;
