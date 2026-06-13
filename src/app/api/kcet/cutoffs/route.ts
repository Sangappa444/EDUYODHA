import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/sqlite';
import { getCategoryForCourse } from '@/utils/kcet';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const round = searchParams.get('round');
    const college_code = searchParams.get('college_code');
    const category = searchParams.get('category');
    const course_name = searchParams.get('course_name');
    const course_category = searchParams.get('course_category');

    let query = 'SELECT * FROM cutoffs WHERE 1=1';
    const params: any[] = [];

    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }
    if (round) {
      query += ' AND round = ?';
      params.push(round);
    }

    if (college_code) {
      const codesList = college_code.split(',').filter(Boolean);
      if (codesList.length > 0) {
        const placeholders = codesList.map(() => '?').join(',');
        query += ` AND college_code IN (${placeholders})`;
        params.push(...codesList);
      }
    }

    if (category) {
      const categoriesList = category.split(',').filter(Boolean);
      if (categoriesList.length > 0) {
        const placeholders = categoriesList.map(() => '?').join(',');
        query += ` AND category IN (${placeholders})`;
        params.push(...categoriesList);
      }
    }

    if (course_name) {
      const coursesList = course_name.split(',').filter(Boolean);
      if (coursesList.length > 0) {
        const placeholders = coursesList.map(() => '?').join(',');
        query += ` AND course_name IN (${placeholders})`;
        params.push(...coursesList);
      }
    }

    query += ' ORDER BY college_name, course_name, year, round';

    interface CutoffRow {
      college_code: string;
      college_name: string;
      course_name: string;
      cutoff_rank: string;
      year: string;
      round: string;
      category: string;
    }

    let results = await queryAll<CutoffRow>(query, params);

    if (course_category) {
      results = results.filter((row) => getCategoryForCourse(row.course_name) === course_category);
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error in KCET cutoffs API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
