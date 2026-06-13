import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  itemType: 'course' | 'pdf';
  amount: number;
  razorpayOrderId: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: Date;
}

const OrderSchema: Schema<IOrder> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: Schema.Types.ObjectId, required: true },
  itemType: { type: String, enum: ['course', 'pdf'], required: true },
  amount: { type: Number, required: true },
  razorpayOrderId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
