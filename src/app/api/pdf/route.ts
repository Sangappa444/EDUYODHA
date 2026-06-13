import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Pdf from '@/models/pdf';
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

// GET all PDFs
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const filter: any = {};
    if (category && category !== 'All') {
      filter.category = category;
    }

    const pdfs = await Pdf.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(pdfs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}

// POST create PDF (Admin)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const { title, description, url, category, semester, price, isPremium } = body;

    if (!title || !description || !url || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pdf = await Pdf.create({
      title,
      description,
      url,
      category,
      semester: semester ? parseInt(semester, 10) : undefined,
      price: price ? parseFloat(price) : 0,
      isPremium: !!isPremium,
    });

    return NextResponse.json({ success: true, pdf });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}
