import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/user';
import Course from '@/models/course';
import Video from '@/models/video';
import Pdf from '@/models/pdf';
import BlogPost from '@/models/blogPost';
import VtuUpdate from '@/models/vtuUpdate';
import bcrypt from 'bcryptjs';

export async function GET() {
  await dbConnect();

  try {
    // 1. Seed Users
    const userCount = await User.countDocuments();
    let adminUser = null;
    let studentUser = null;

    if (userCount === 0) {
      console.log('Seeding users...');
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      const studentPasswordHash = await bcrypt.hash('student123', 10);

      adminUser = await User.create({
        name: 'EduYodha Admin',
        email: 'admin@eduyodha.com',
        password: adminPasswordHash,
        role: 'admin',
        isPro: true,
      });

      studentUser = await User.create({
        name: 'Demo Student',
        email: 'student@eduyodha.com',
        password: studentPasswordHash,
        role: 'student',
        isPro: false,
      });
    }

    // 2. Seed Courses & Videos
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      console.log('Seeding courses...');
      
      const mlIntroCourse = await Course.create({
        title: 'Introduction to Machine Learning (Kannada)',
        description: 'Learn the fundamentals of Machine Learning, definitions, knowledge pyramids, and relation to AI & Deep Learning, taught in simple Kannada.',
        thumbnail: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=500&auto=format&fit=crop&q=60',
        price: 0,
        isPremium: false,
        category: 'Machine Learning',
      });

      const mlAdvancedCourse = await Course.create({
        title: 'Mastering Machine Learning Algorithms',
        description: 'Dive deep into supervised, unsupervised, semi-supervised, and reinforcement learning, covering challenges like overfitting and bias/variance.',
        thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop&q=60',
        price: 499,
        isPremium: true,
        category: 'Machine Learning',
      });

      // Seed Videos
      await Video.create([
        {
          title: 'Machine learning | what is machine learning',
          youtubeId: 'iVZFg84Ygks',
          courseId: mlIntroCourse._id,
          description: 'Introduction, definition and example in Kannada',
          isPremium: false,
          category: 'Machine Learning',
        },
        {
          title: 'Why do we need ML | importance | popularity',
          youtubeId: 'e4J9Lhnnbho',
          courseId: mlIntroCourse._id,
          description: 'Why Machine Learning became popular and its importance',
          isPremium: false,
          category: 'Machine Learning',
        },
        {
          title: 'Knowledge pyramid | Machine Learning | DIKW model',
          youtubeId: 'pAn_qQ2-ATE',
          courseId: mlIntroCourse._id,
          description: 'Data to Information to Knowledge to Wisdom in Kannada',
          isPremium: false,
          category: 'Machine Learning',
        },
        {
          title: 'Artificial intelligence, neural network, deep learning',
          youtubeId: 'yvwj1w0vk1k',
          courseId: mlIntroCourse._id,
          description: 'Relation of ML to other technologies',
          isPremium: false,
          category: 'Machine Learning',
        },
        {
          title: 'Types of Machine learning | fundamentals | basics',
          youtubeId: 'nnLyVa_HeUY',
          courseId: mlIntroCourse._id,
          description: 'Core concepts and basics in EDU YODHA',
          isPremium: false,
          category: 'Machine Learning',
        },
        {
          title: 'Supervised Learning | Types of Machine Learning',
          youtubeId: '_YPF5uwWttI',
          courseId: mlIntroCourse._id,
          description: 'Basic concepts of Supervised Learning',
          isPremium: false,
          category: 'Machine Learning',
        },
        // Premium Videos
        {
          title: 'Unsupervised learning | Types of Machine Learning',
          youtubeId: 'tOgTJL4D1Ig',
          courseId: mlAdvancedCourse._id,
          description: 'Concepts and fundamentals of Unsupervised ML',
          isPremium: true,
          category: 'Machine Learning',
        },
        {
          title: 'Semi-supervised and reinforcement learning',
          youtubeId: 'ymDQ8hxbLT4',
          courseId: mlAdvancedCourse._id,
          description: 'Understanding Reinforcement and Semi-supervised ML',
          isPremium: true,
          category: 'Machine Learning',
        },
        {
          title: 'Challenges of Machine Learning',
          youtubeId: 'oYDKewCVmLY',
          courseId: mlAdvancedCourse._id,
          description: 'Overfitting, Underfitting, Bias & Variance',
          isPremium: true,
          category: 'Machine Learning',
        },
        {
          title: 'CRISP-DM Process Explained',
          youtubeId: 'eyWPaManDA4',
          courseId: mlAdvancedCourse._id,
          description: 'Simple Friendship Example | ML process',
          isPremium: true,
          category: 'Machine Learning',
        },
      ]);
    }

    // 3. Seed PDFs
    const pdfCount = await Pdf.countDocuments();
    if (pdfCount === 0) {
      console.log('Seeding PDFs...');
      await Pdf.create([
        {
          title: 'VTU 6th Sem Computer Networks Notes',
          description: 'Complete syllabus notes for Computer Networks including socket programming and routing algorithms.',
          url: 'https://res.cloudinary.com/demo/image/upload/v1570975200/sample.pdf',
          category: 'vtu-notes',
          semester: 6,
          price: 0,
          isPremium: false,
        },
        {
          title: 'VTU 6th Sem Machine Learning Complete Formula Sheet',
          description: 'A curated sheet with all the ML formulas, decision tree mathematics, and Bayesian logic.',
          url: 'https://res.cloudinary.com/demo/image/upload/v1570975200/sample.pdf',
          category: 'vtu-notes',
          semester: 6,
          price: 49,
          isPremium: true,
        },
        {
          title: 'KCET Mock Test Sample Paper - Mathematics (Physics / Chemistry)',
          description: 'A 60-question mock test format sample paper mapped to latest KEA syllabus.',
          url: 'https://res.cloudinary.com/demo/image/upload/v1570975200/sample.pdf',
          category: 'kcet-materials',
          price: 0,
          isPremium: false,
        },
      ]);
    }

    // 4. Seed Blogs
    const blogCount = await BlogPost.countDocuments();
    if (blogCount === 0) {
      console.log('Seeding blogs...');
      await BlogPost.create([
        {
          title: 'How to Crack KCET 2026: 3-Month Strategy Plan',
          slug: 'how-to-crack-kcet-2026-strategy',
          content: 'Crack KCET with this comprehensive guide containing tips, resources, study routines, and rank-improving tactics for engineering students in Karnataka.',
          metaDescription: 'Find tips and a complete 3-month strategy plan to score well and secure a low rank in KCET 2026.',
          tags: ['KCET', 'KEA', 'Engineering', 'Preparation'],
          thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60',
        },
        {
          title: 'VTU Circular Update: New Syllabus for 2026 Scheme',
          slug: 'vtu-circular-new-syllabus-2026',
          content: 'Visvesvaraya Technological University (VTU) has released a new circular outlining modifications in 6th and 7th-semester computer science streams. Read details here.',
          metaDescription: 'Stay updated on VTU circulars and latest syllabus details for computer science engineering.',
          tags: ['VTU', 'Circular', 'Syllabus', 'Engineering'],
          thumbnail: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&auto=format&fit=crop&q=60',
        },
      ]);
    }

    // 5. Seed VTU Updates
    const vtuCount = await VtuUpdate.countDocuments();
    if (vtuCount === 0) {
      console.log('Seeding VTU updates...');
      await VtuUpdate.create([
        {
          title: 'VTU June/July 2026 Exam Hall Ticket Download Link Active',
          content: 'VTU has activated the hall ticket downloading portal for undergraduate engineering exams. Contact college administrators for approvals.',
          category: 'notifications',
          createdAt: new Date(),
        },
        {
          title: 'VTU B.E 5th Semester Revaluation Results Announced',
          content: 'VTU has released the revaluation results for B.E 5th Semester CBSC exams. Students can check results via the official KEA/VTU results page.',
          category: 'results',
          semester: 5,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          title: 'Official Circular: Academic Calendar for Even Semesters 2026',
          content: 'Visvesvaraya Technological University has published the official academic calendar for 4th, 6th, and 8th semester classes starting from March.',
          category: 'circulars',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Initial seeding completed successfully!',
      users: {
        admin: adminUser ? 'admin@eduyodha.com' : 'Already seeded',
        student: studentUser ? 'student@eduyodha.com' : 'Already seeded',
      },
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
