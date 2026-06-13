'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Users, BookOpen, FileText, TrendingUp, Sparkles, Bell, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Analytics {
  users: number;
  courses: number;
  pdfs: number;
  updates: number;
  blogs: number;
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [vtuTitle, setVtuTitle] = useState('');
  const [vtuContent, setVtuContent] = useState('');
  const [vtuCategory, setVtuCategory] = useState('notifications');
  const [vtuSemester, setVtuSemester] = useState('');
  const [vtuStatus, setVtuStatus] = useState('');

  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseThumb, setCourseThumb] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60');
  const [courseCategory, setCourseCategory] = useState('Machine Learning');
  const [coursePrice, setCoursePrice] = useState('199');
  const [coursePremium, setCoursePremium] = useState(true);
  const [courseStatus, setCourseStatus] = useState('');

  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfDesc, setPdfDesc] = useState('');
  const [pdfUrl, setPdfUrl] = useState('https://res.cloudinary.com/demo/image/upload/v1570975200/sample.pdf');
  const [pdfCategory, setPdfCategory] = useState('vtu-notes');
  const [pdfPrice, setPdfPrice] = useState('49');
  const [pdfPremium, setPdfPremium] = useState(true);
  const [pdfSemester, setPdfSemester] = useState('6');
  const [pdfStatus, setPdfStatus] = useState('');

  const [analytics, setAnalytics] = useState<Analytics>({
    users: 2,
    courses: 2,
    pdfs: 3,
    updates: 3,
    blogs: 2,
  });

  useEffect(() => {
    // Check if logged in user is admin
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      if (parsed.role === 'admin') {
        setIsAdminUser(true);
      }
    }
    setLoading(false);
  }, []);

  const handleCreateVtuUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setVtuStatus('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/vtu-updates', {
        title: vtuTitle,
        content: vtuContent,
        category: vtuCategory,
        semester: vtuSemester ? parseInt(vtuSemester, 10) : undefined
      }, { headers: { Authorization: `Bearer ${token}` } });

      setVtuStatus('VTU Update created successfully!');
      setVtuTitle('');
      setVtuContent('');
      setAnalytics(prev => ({ ...prev, updates: prev.updates + 1 }));
    } catch (err: any) {
      setVtuStatus(err.response?.data?.error || 'Failed to create update.');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseStatus('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/courses', {
        title: courseTitle,
        description: courseDesc,
        thumbnail: courseThumb,
        price: parseFloat(coursePrice),
        isPremium: coursePremium,
        category: courseCategory
      }, { headers: { Authorization: `Bearer ${token}` } });

      setCourseStatus('Premium Course created successfully!');
      setCourseTitle('');
      setCourseDesc('');
      setAnalytics(prev => ({ ...prev, courses: prev.courses + 1 }));
    } catch (err: any) {
      setCourseStatus(err.response?.data?.error || 'Failed to create course.');
    }
  };

  const handleCreatePdf = async (e: React.FormEvent) => {
    e.preventDefault();
    setPdfStatus('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/pdf', {
        title: pdfTitle,
        description: pdfDesc,
        url: pdfUrl,
        category: pdfCategory,
        price: parseFloat(pdfPrice),
        isPremium: pdfPremium,
        semester: pdfSemester ? parseInt(pdfSemester, 10) : undefined
      }, { headers: { Authorization: `Bearer ${token}` } });

      setPdfStatus('Note resources added to store!');
      setPdfTitle('');
      setPdfDesc('');
      setAnalytics(prev => ({ ...prev, pdfs: prev.pdfs + 1 }));
    } catch (err: any) {
      setPdfStatus(err.response?.data?.error || 'Failed to add PDF.');
    }
  };

  if (loading) {
    return <div className="text-center py-20">Verifying privileges...</div>;
  }

  if (!isAdminUser) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-3xl text-center shadow-xl">
        <ShieldAlert size={40} className="text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold">Access Denied</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          This dashboard requires administrator privileges. Please sign in as admin@eduyodha.com (pass: admin123).
        </p>
        <Link href="/auth/login" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-left">
      {/* Header */}
      <header className="mb-8 flex items-center gap-3">
        <LayoutDashboard className="text-amber-500" size={24} />
        <div>
          <h1 className="text-2xl font-black text-slate-850 dark:text-slate-100">EduYodha Admin Dashboard</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Welcome, {user?.name || 'Administrator'} (Role: Admin)</p>
        </div>
      </header>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <div className="bg-white dark:bg-[#0f172a]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <Users size={16} className="text-blue-500 mb-2" />
          <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Users</span>
          <span className="text-xl font-black">{analytics.users}</span>
        </div>
        <div className="bg-white dark:bg-[#0f172a]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <BookOpen size={16} className="text-indigo-500 mb-2" />
          <span className="block text-[10px] font-bold text-slate-400 uppercase">Active Courses</span>
          <span className="text-xl font-black">{analytics.courses}</span>
        </div>
        <div className="bg-white dark:bg-[#0f172a]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <FileText size={16} className="text-amber-500 mb-2" />
          <span className="block text-[10px] font-bold text-slate-400 uppercase">Store PDFs</span>
          <span className="text-xl font-black">{analytics.pdfs}</span>
        </div>
        <div className="bg-white dark:bg-[#0f172a]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <Bell size={16} className="text-emerald-500 mb-2" />
          <span className="block text-[10px] font-bold text-slate-400 uppercase">VTU circulars</span>
          <span className="text-xl font-black">{analytics.updates}</span>
        </div>
        <div className="bg-white dark:bg-[#0f172a]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <TrendingUp size={16} className="text-rose-500 mb-2" />
          <span className="block text-[10px] font-bold text-slate-400 uppercase">Blogs</span>
          <span className="text-xl font-black">{analytics.blogs}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* VTU circular Form */}
        <div className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
            <Bell size={14} className="text-blue-500" />
            <span>Publish VTU circular</span>
          </h3>
          {vtuStatus && (
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg border border-blue-200/20 mb-4 flex items-center gap-1">
              <CheckCircle2 size={12} /> {vtuStatus}
            </div>
          )}
          <form onSubmit={handleCreateVtuUpdate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Update Title</label>
              <input type="text" value={vtuTitle} onChange={(e) => setVtuTitle(e.target.value)} required placeholder="e.g. 6th sem Exam Dates released" className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Category</label>
              <select value={vtuCategory} onChange={(e) => setVtuCategory(e.target.value)} className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                <option value="notifications">Notification/Announcement</option>
                <option value="circulars">Circular</option>
                <option value="results">Results Update</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Target Semester (Optional)</label>
              <input type="number" value={vtuSemester} onChange={(e) => setVtuSemester(e.target.value)} placeholder="e.g. 6" className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Detailed Content</label>
              <textarea value={vtuContent} onChange={(e) => setVtuContent(e.target.value)} required rows={3} placeholder="Write announcement details..." className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none" />
            </div>
            <button type="submit" className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 cursor-pointer">
              <Send size={12} /> Publish circular
            </button>
          </form>
        </div>

        {/* Courses creation form */}
        <div className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
            <BookOpen size={14} className="text-indigo-500" />
            <span>Create Course Module</span>
          </h3>
          {courseStatus && (
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg border border-blue-200/20 mb-4 flex items-center gap-1">
              <CheckCircle2 size={12} /> {courseStatus}
            </div>
          )}
          <form onSubmit={handleCreateCourse} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Course Title</label>
              <input type="text" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} required placeholder="e.g. Advanced Cryptography" className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Category Stream</label>
              <input type="text" value={courseCategory} onChange={(e) => setCourseCategory(e.target.value)} required placeholder="e.g. Cryptography" className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Price (INR)</label>
                <input type="number" value={coursePrice} onChange={(e) => setCoursePrice(e.target.value)} placeholder="499" className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
              </div>
              <div className="flex items-center gap-2 mt-4 select-none">
                <input type="checkbox" id="coursePremium" checked={coursePremium} onChange={(e) => setCoursePremium(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                <label htmlFor="coursePremium" className="text-xs font-bold text-slate-500 cursor-pointer flex items-center gap-1"><Sparkles size={12} className="text-amber-500" /> Premium</label>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Course Description</label>
              <textarea value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} required rows={3} placeholder="Provide details about lectures..." className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none" />
            </div>
            <button type="submit" className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 cursor-pointer">
              <Send size={12} /> Add Course
            </button>
          </form>
        </div>

        {/* PDF Store items upload form */}
        <div className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
            <FileText size={14} className="text-amber-500" />
            <span>Upload Notes / PDFs</span>
          </h3>
          {pdfStatus && (
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg border border-blue-200/20 mb-4 flex items-center gap-1">
              <CheckCircle2 size={12} /> {pdfStatus}
            </div>
          )}
          <form onSubmit={handleCreatePdf} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Document Title</label>
              <input type="text" value={pdfTitle} onChange={(e) => setPdfTitle(e.target.value)} required placeholder="e.g. CN Socket Prog Guide" className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Category</label>
                <select value={pdfCategory} onChange={(e) => setPdfCategory(e.target.value)} className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                  <option value="vtu-notes">VTU Sem Notes</option>
                  <option value="kcet-materials">KCET Materials</option>
                  <option value="other">Other PDF</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Target Semester</label>
                <input type="number" value={pdfSemester} onChange={(e) => setPdfSemester(e.target.value)} placeholder="6" className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Price (INR)</label>
                <input type="number" value={pdfPrice} onChange={(e) => setPdfPrice(e.target.value)} placeholder="49" className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
              </div>
              <div className="flex items-center gap-2 mt-4 select-none">
                <input type="checkbox" id="pdfPremium" checked={pdfPremium} onChange={(e) => setPdfPremium(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                <label htmlFor="pdfPremium" className="text-xs font-bold text-slate-500 cursor-pointer flex items-center gap-1"><Sparkles size={12} className="text-amber-500" /> Premium</label>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Syllabus Description</label>
              <textarea value={pdfDesc} onChange={(e) => setPdfDesc(e.target.value)} required rows={3} placeholder="Syllabus coverage highlights..." className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none" />
            </div>
            <button type="submit" className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 cursor-pointer">
              <Send size={12} /> Add to Store
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
