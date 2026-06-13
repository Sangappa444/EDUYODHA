import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/sqlite';
import { getCategoryForCourse } from '@/utils/kcet';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rankStr = searchParams.get('rank');
    const categoryStr = searchParams.get('category');
    const courseNameStr = searchParams.get('course_name');
    const courseCategory = searchParams.get('course_category');

    if (!rankStr || !categoryStr) {
      return NextResponse.json({ error: 'Rank and category are required' }, { status: 400 });
    }

    const userRank = parseInt(rankStr, 10);
    const categoriesList = categoryStr.split(',').filter(Boolean);

    if (categoriesList.length === 0) {
      return NextResponse.json({ error: 'At least one category is required' }, { status: 400 });
    }

    let query = `
      SELECT college_code, college_name, course_name, cutoff_rank, year, round, category 
      FROM cutoffs 
      WHERE 1=1
    `;
    const params: any[] = [];

    const catPlaceholders = categoriesList.map(() => '?').join(',');
    query += ` AND category IN (${catPlaceholders})`;
    params.push(...categoriesList);

    if (courseNameStr) {
      const coursesList = courseNameStr.split(',').filter(Boolean);
      if (coursesList.length > 0) {
        const placeholders = coursesList.map(() => '?').join(',');
        query += ` AND course_name IN (${placeholders})`;
        params.push(...coursesList);
      }
    }

    interface PredictionRow {
      college_code: string;
      college_name: string;
      course_name: string;
      cutoff_rank: string;
      year: string;
      round: string;
      category: string;
    }

    const rows = await queryAll<PredictionRow>(query, params);

    interface PredictionResult extends PredictionRow {
      cutoff_rank_num: number;
      chances: 'Safe' | 'Moderate' | 'Tough';
    }

    let predictions: PredictionResult[] = rows
      .map((row) => {
        const cutoff = parseInt(row.cutoff_rank, 10);
        if (isNaN(cutoff)) return null;

        let chances: 'Safe' | 'Moderate' | 'Tough' = 'Tough';
        if (userRank <= cutoff * 0.8) {
          chances = 'Safe';
        } else if (userRank <= cutoff) {
          chances = 'Moderate';
        }

        return {
          ...row,
          cutoff_rank_num: cutoff,
          chances,
        };
      })
      .filter((r): r is PredictionResult => r !== null);

    if (courseCategory) {
      predictions = predictions.filter((r) => getCategoryForCourse(r.course_name) === courseCategory);
    }

    // Sort predictions: cutoff rank asc, year desc, round desc, college name asc
    predictions.sort((a, b) => {
      if (a.cutoff_rank_num !== b.cutoff_rank_num) {
        return a.cutoff_rank_num - b.cutoff_rank_num;
      }
      const yearA = parseInt(a.year, 10) || 0;
      const yearB = parseInt(b.year, 10) || 0;
      if (yearA !== yearB) {
        return yearB - yearA; // Latest year first
      }
      const roundA = parseInt(a.round, 10) || 0;
      const roundB = parseInt(b.round, 10) || 0;
      if (roundA !== roundB) {
        return roundB - roundA; // Highest round first
      }
      const collegeCompare = a.college_name.localeCompare(b.college_name);
      return collegeCompare !== 0 ? collegeCompare : a.course_name.localeCompare(b.course_name);
    });

    return NextResponse.json(predictions);
  } catch (error: any) {
    console.error('Error in KCET prediction API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
