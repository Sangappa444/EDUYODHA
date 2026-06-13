import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/sqlite';
import { getCategoryForCourse } from '@/utils/kcet';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const sql = 'SELECT DISTINCT course_name FROM cutoffs ORDER BY course_name';
    interface CourseRow {
      course_name: string;
    }
    const rows = await queryAll<CourseRow>(sql);
    let courses = rows.map((row) => row.course_name);

    if (category) {
      courses = courses.filter((course) => getCategoryForCourse(course) === category);
    }

    return NextResponse.json(courses);
  } catch (error: any) {
    console.error('Error in KCET courses API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
