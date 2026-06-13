'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Play, Lock, Sparkles, BookOpen } from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  isPremium: boolean;
  category: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [user, setUser] = useState<{ id: string; role: string; isPro: boolean } | null>(null);

  useEffect(() => {
    // Get user
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Fetch courses
    axios.get('/api/courses')
      .then(res => {
        setCourses(res.data);
      })
      .catch(err => {
        console.error('Error fetching courses:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];

  const filteredCourses = activeTab === 'All' 
    ? courses 
    : courses.filter(c => c.category === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-10 animate-fade-in">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 bg-clip-text text-transparent mb-2">
          EduYodha Digital Courses
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm font-semibold">
          Learn high-quality engineering topics and preparation modules taught by experts. Explore our free and premium lectures.
        </p>
      </header>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === cat
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <span className="text-sm font-bold text-slate-500 animate-pulse">Loading course catalogue...</span>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#0f172a]/20 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 max-w-md mx-auto">
          <BookOpen size={40} className="mx-auto text-slate-350 mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No courses found</h3>
          <p className="text-xs text-slate-500 mt-1">There are no courses loaded in this category yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => {
            const hasAccess = !course.isPremium || user?.isPro;
            return (
              <div 
                key={course._id} 
                className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                {/* Thumbnail */}
                <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-900 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  {course.isPremium && (
                    <span className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-slate-950 font-bold text-[9px] uppercase tracking-wider rounded-full shadow-lg">
                      <Sparkles size={10} />
                      <span>Premium</span>
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow text-left">
                  <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">
                    {course.category}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 mb-2 line-clamp-1 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed flex-grow">
                    {course.description}
                  </p>

                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-auto">
                    <div>
                      {course.isPremium ? (
                        <div>
                          <span className="text-xs font-semibold text-slate-400 line-through">₹999</span>
                          <span className="block text-base font-black text-amber-500">₹{course.price}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Free
                        </span>
                      )}
                    </div>

                    {hasAccess ? (
                      <Link
                        href={`/courses/${course._id}`}
                        className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all uppercase tracking-wide"
                      >
                        <Play size={10} fill="white" />
                        <span>Watch Now</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/courses/${course._id}`}
                        className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all uppercase tracking-wide"
                      >
                        <Lock size={10} />
                        <span>Unlock Course</span>
                      </Link>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
