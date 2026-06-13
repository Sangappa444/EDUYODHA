'use client';

import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import { Calendar, Tag, ArrowLeft, Loader, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  title: string;
  slug: string;
  content: string;
  metaDescription: string;
  tags: string[];
  thumbnail: string;
  createdAt: string;
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/blog/${slug}`)
      .then(res => {
        setPost(res.data);
      })
      .catch(err => {
        console.error('Error fetching blog post:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2">
        <Loader className="animate-spin text-blue-600" size={32} />
        <span className="text-sm font-semibold text-slate-500">Loading article...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h3 className="text-xl font-bold">Article not found</h3>
        <Link href="/blog" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back to blogs */}
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6">
        <ArrowLeft size={14} />
        <span>Back to Blogs</span>
      </Link>

      <article className="text-left">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-850 dark:text-slate-100 mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Meta details */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            <span>Published on {new Date(post.createdAt).toLocaleDateString()}</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold">
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Thumbnail Image */}
        <div className="w-full aspect-video rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Meta Description highlight block */}
        <div className="bg-slate-100/50 dark:bg-slate-900/40 border-l-4 border-blue-500 rounded-r-xl p-4 mb-6 text-sm italic font-semibold text-slate-600 dark:text-slate-350 leading-relaxed">
          {post.metaDescription}
        </div>

        {/* Full Article Content */}
        <div className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed space-y-4 font-medium whitespace-pre-line">
          {post.content}
        </div>

        {/* Discussion comments section preview */}
        <div className="mt-12 bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
            <MessageSquare size={16} className="text-blue-500" />
            <span>Comments Section</span>
          </h3>
          <p className="text-xs text-slate-500">Sign in to join the discussion and post feedback about this guide.</p>
        </div>

      </article>

    </div>
  );
}
