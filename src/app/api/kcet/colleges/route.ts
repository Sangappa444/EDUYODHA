import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/sqlite';

export async function GET() {
  try {
    const sql = 'SELECT DISTINCT college_code, college_name FROM cutoffs ORDER BY college_name';
    interface CollegeRow {
      college_code: string;
      college_name: string;
    }
    const rows = await queryAll<CollegeRow>(sql);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error in KCET colleges API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
