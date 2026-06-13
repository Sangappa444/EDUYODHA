import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Video from '@/models/video';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    // Find all videos associated with this course ID
    const lessons = await Video.find({ courseId: id }).sort({ createdAt: 1 });
    return NextResponse.json(lessons);
  } catch (error: any) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
