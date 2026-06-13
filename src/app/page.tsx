'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Play, FileText, Bell, Award, ArrowRight, ShieldCheck, GraduationCap, Users } from 'lucide-react';

interface VtuUpdate {
  _id: string;
  title: string;
  content: string;
  category: 'results' | 'notifications' | 'circulars';
  semester?: number;
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  isPremium: boolean;
  category: string;
}

interface PdfItem {
  _id: string;
  title: string;
  category: string;
  isPremium: boolean;
}

export default function HomePage() {
  const [vtuUpdates, setVtuUpdates] = useState<VtuUpdate[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);
  
  const [vtuFilter, setVtuFilter] = useState('all');
  const [vtuSemester, setVtuSemester] = useState('all');
  const [loading, setLoading] = useState(true);

  // Trigger db seed and fetch initial homepage items
  useEffect(() => {
    const initializeHome = async () => {
      try {
        // Run database seeding if database is empty
        await axios.get('/api/seed');
        
        // Fetch updates, courses, and pdfs
        const updatesRes = await axios.get('/api/vtu-updates');
        setVtuUpdates(updatesRes.data);

        const coursesRes = await axios.get('/api/courses');
        setCourses(coursesRes.data.slice(0, 3)); // Display first 3 courses

        const pdfsRes = await axios.get('/api/pdf');
        setPdfs(pdfsRes.data.slice(0, 3)); // Display first 3 pdfs
      } catch (err) {
        console.error('Home initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeHome();
  }, []);

  const filteredUpdates = vtuUpdates.filter(update => {
    if (vtuFilter !== 'all' && update.category !== vtuFilter) return false;
    if (vtuSemester !== 'all' && update.semester !== parseInt(vtuSemester, 10)) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-16 pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-slate-900/0 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-slate-950/0 py-20 border-b border-slate-200 dark:border-slate-850">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="text-left flex flex-col gap-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] uppercase tracking-wider rounded-full max-w-max shadow-sm border border-blue-200/20">
              ⚡ Karnataka\'s Digital Academy
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Learn Smart.<br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 bg-clip-text text-transparent">
                Achieve More.
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold max-w-lg leading-relaxed">
              EduYodha is the premier learning platform for engineering students. Check KCET college predictor trends, access semester notes, and watch free or premium courses.
            </p>

            <div className="flex flex-wrap gap-4 mt-2">
              <Link
                href="/kcet"
                className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/20 uppercase text-xs tracking-wider transition-all cursor-pointer"
              >
                <Award size={14} />
                <span>KCET Rank Predictor</span>
              </Link>
              <Link
                href="/courses"
                className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40 font-extrabold rounded-2xl shadow-sm uppercase text-xs tracking-wider transition-all cursor-pointer"
              >
                <GraduationCap size={14} />
                <span>Explore Courses</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards (Right Side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#0f172a]/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-left shadow-lg">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl w-max mb-4">
                <Users size={20} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">10,000+</h3>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Students Mentored</p>
            </div>
            <div className="bg-white dark:bg-[#0f172a]/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-left shadow-lg">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl w-max mb-4">
                <Play size={20} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">50+ Hours</h3>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Video Lessons</p>
            </div>
            <div className="bg-white dark:bg-[#0f172a]/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-left shadow-lg">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-max mb-4">
                <FileText size={20} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">200+ Notes</h3>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Free & Premium PDFs</p>
            </div>
            <div className="bg-white dark:bg-[#0f172a]/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-left shadow-lg">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl w-max mb-4">
                <Award size={20} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">99.8%</h3>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Predictor Accuracy</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. VTU Updates Section */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 text-left border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="text-blue-600 dark:text-blue-400" size={20} />
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Latest VTU Board updates</h2>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={vtuFilter}
              onChange={(e) => setVtuFilter(e.target.value)}
              className="p-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
            >
              <option value="all">All Board News</option>
              <option value="circulars">Circulars</option>
              <option value="notifications">Announcements</option>
              <option value="results">Results Updates</option>
            </select>
            <select
              value={vtuSemester}
              onChange={(e) => setVtuSemester(e.target.value)}
              className="p-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
            >
              <option value="all">All Semesters</option>
              <option value="5">5th Semester</option>
              <option value="6">6th Semester</option>
              <option value="7">7th Semester</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <span className="text-xs text-slate-500 animate-pulse">Checking board updates...</span>
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-[#0f172a]/20 border border-slate-200 dark:border-slate-850 rounded-2xl">
            <span className="text-xs text-slate-500">No matching board circulars found.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredUpdates.map(update => (
              <div 
                key={update._id}
                className="flex items-start justify-between p-4 bg-white dark:bg-[#0f172a]/40 border border-slate-200 dark:border-slate-800 rounded-2xl gap-4 hover:border-blue-500 transition-colors text-left"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[9px] font-extrabold rounded uppercase tracking-wider">
                      {update.category}
                    </span>
                    {update.semester && (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold rounded">
                        Sem {update.semester}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {new Date(update.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-100 mb-1">{update.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{update.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 text-left">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Featured Study Courses</h2>
          <Link href="/courses" className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map(course => (
            <div 
              key={course._id}
              className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow flex flex-col justify-between hover:shadow-lg transition-all text-left"
            >
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={course.thumbnail} alt={course.title} className="w-full h-36 object-cover" />
                <div className="p-4">
                  <span className="text-[9px] font-extrabold text-blue-500 uppercase tracking-wide">{course.category}</span>
                  <h3 className="text-xs font-extrabold text-slate-850 dark:text-slate-100 mb-2 mt-0.5 line-clamp-1">{course.title}</h3>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-semibold">{course.description}</p>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {course.isPremium ? `₹${course.price}` : 'Free'}
                </span>
                <Link href={`/courses/${course._id}`} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold rounded-lg uppercase tracking-wide">
                  Explore
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Popular PDFs */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 text-left">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Popular Notes & Study Sheets</h2>
          <Link href="/pdf" className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
            <span>Visit Store</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pdfs.map(pdf => (
            <div 
              key={pdf._id}
              className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow flex justify-between items-center text-left"
            >
              <div className="min-w-0">
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[8px] font-extrabold rounded uppercase tracking-wider">
                  {pdf.category}
                </span>
                <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-100 truncate mt-1.5">{pdf.title}</h4>
              </div>
              <Link href="/pdf" className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 shrink-0">
                <FileText size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Student Testimonials */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 text-left">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">What Our Students Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-slate-50 dark:bg-[#0f172a]/20 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
              "The KCET College Predictor was extremely helpful during option entry. It predicted I could get ISE at BMSCE based on my rank, and that\'s exactly what was allotted! Downlading the choice checklist saved me a lot of confusion."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <span className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                AN
              </span>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Ananya N.</h4>
                <p className="text-[9px] font-bold text-slate-400">BMSCE (ISE Branch)</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-[#0f172a]/20 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
              "EduYodha is my go-to for VTU updates and Computer Science notes. The Machine Learning videos in Kannada made complex algorithms like decision trees and SVM so easy to understand. Best platform for engineering preparation in Karnataka."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <span className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                SK
              </span>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Sanjay K.</h4>
                <p className="text-[9px] font-bold text-slate-400">VTU 6th Semester Student</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
