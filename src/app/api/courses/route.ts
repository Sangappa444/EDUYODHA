import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Course from '@/models/course';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_edu_yodha';

async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded && decoded.role === 'admin';
  } catch (e) {
    return false;
  }
}

// GET all courses
export async function GET() {
  try {
    await dbConnect();
    const courses = await Course.find({}).sort({ createdAt: -1 });
    return NextResponse.json(courses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create course (Admin)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const { title, description, thumbnail, price, isPremium, category } = body;

    if (!title || !description || !thumbnail || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const course = await Course.create({
      title,
      description,
      thumbnail,
      price: price ? parseFloat(price) : 0,
      isPremium: !!isPremium,
      category,
    });

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
