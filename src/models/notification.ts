import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  userId?: mongoose.Types.ObjectId; // If target user is specific, otherwise broadcast to all
  createdAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
