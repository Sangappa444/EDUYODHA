import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import VtuUpdate from '@/models/vtuUpdate';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_edu_yodha';

// Helper to check if admin
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

// GET all updates
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const semester = searchParams.get('semester');

    const filter: any = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (semester && semester !== 'all') {
      filter.semester = parseInt(semester, 10);
    }

    const updates = await VtuUpdate.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(updates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create update
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const { title, content, category, semester, attachmentUrl } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
    }

    const update = await VtuUpdate.create({
      title,
      content,
      category,
      semester: semester ? parseInt(semester, 10) : undefined,
      attachmentUrl,
    });

    return NextResponse.json({ success: true, update });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
