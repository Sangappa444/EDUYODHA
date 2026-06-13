import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  orderId: mongoose.Types.ObjectId; // References our internal Order
  razorpayPaymentId: string;
  razorpaySignature: string;
  amount: number;
  status: string;
  createdAt: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  razorpayPaymentId: { type: String, required: true },
  razorpaySignature: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'captured' },
  createdAt: { type: Date, default: Date.now },
});

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;
