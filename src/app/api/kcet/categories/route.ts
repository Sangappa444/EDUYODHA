import { NextResponse } from 'next/server';

export async function GET() {
  const categories = [
    'Engineering',
    'Agriculture',
    'Veterinary',
    'B.Pharm',
    'D.Pharm',
    'B.Sc Nursing',
    'BNYS',
    'Allied Health Sciences',
    'BPT',
    'BPO',
    'Architecture',
  ];
  return NextResponse.json(categories);
}
