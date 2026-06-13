import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Order from '@/models/order';
import Razorpay from 'razorpay';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_edu_yodha';

// Initialize Razorpay (with dummy/mock credentials fallback to allow offline local testing)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId123456',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mockKeySecret123456789',
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();
    const { itemId, itemType, amount } = await request.json();

    if (!itemId || !itemType || !amount) {
      return NextResponse.json({ error: 'Missing purchase details' }, { status: 400 });
    }

    // Create Razorpay Order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      });
    } catch (rzpErr) {
      console.warn('Razorpay SDK failed creating order, falling back to mock Razorpay order structure:', rzpErr);
      // Fallback: Create mock order structure if keys are invalid/offline
      razorpayOrder = {
        id: `order_mock_${Math.floor(Math.random() * 1000000)}`,
        amount: Math.round(amount * 100),
        currency: 'INR',
      };
    }

    // Save Order details in DB
    const newOrder = await Order.create({
      userId: decoded.id,
      itemId,
      itemType,
      amount,
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderDbId: newOrder._id,
    });
  } catch (error: any) {
    console.error('Create Order API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
