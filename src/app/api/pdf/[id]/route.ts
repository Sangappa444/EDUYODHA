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

// GET PDF by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const pdf = await Pdf.findById(id);

    if (!pdf) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    return NextResponse.json(pdf);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}

// PUT update PDF (Admin)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    const body = await request.json();

    const updated = await Pdf.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, pdf: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE PDF (Admin)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const deleted = await Pdf.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'PDF deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}
