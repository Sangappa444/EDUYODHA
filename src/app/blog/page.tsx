'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Calendar, Tag, ArrowRight, BookOpen } from 'lucide-react';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  metaDescription: string;
  tags: string[];
  thumbnail: string;
  createdAt: string;
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/blog')
      .then(res => {
        setPosts(res.data);
      })
      .catch(err => {
        console.error('Error fetching blogs:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 bg-clip-text text-transparent mb-2">
          EduYodha Resources & Blog
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm font-semibold">
          Stay updated with official VTU notifications, circular breakdowns, syllabus tips, and KCET counseling guidelines.
        </p>
      </header>

      {loading ? (
        <div className="text-center py-20">
          <span className="text-sm font-bold text-slate-500 animate-pulse">Loading study blogs...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#0f172a]/20 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 max-w-md mx-auto">
          <BookOpen size={40} className="mx-auto text-slate-350 mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No articles found</h3>
          <p className="text-xs text-slate-500 mt-1">There are no study posts published yet. Please check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <Link 
              href={`/blog/${post.slug}`} 
              key={post._id}
              className="group flex flex-col bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left"
            >
              {/* Thumbnail wrapper */}
              <div className="h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content details */}
              <div className="p-5 flex flex-col justify-between flex-grow">
                <div>
                  {/* Meta Row */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </span>
                    {post.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="flex items-center gap-0.5 text-blue-500 uppercase">
                        <Tag size={10} />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                    {post.metaDescription}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all mt-auto pt-3 border-t border-slate-100 dark:border-slate-850">
                  <span>Read Article</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
