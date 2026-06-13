import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* About Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">
              EduYodha
            </span>
          </div>
          <p className="text-sm text-slate-400">
            EduYodha is Karnataka\'s premium educational portal for VTU Engineering students, KCET aspirants, and digital learning.
          </p>
          <p className="text-xs text-slate-500">
            Learn Smart. Achieve More.
          </p>
        </div>

        {/* KCET Predictor & Resources */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">KCET Tools</h4>
          <ul className="flex flex-col gap-2 text-sm text-slate-400">
            <li>
              <Link href="/kcet" className="hover:text-blue-400 transition-colors">
                Cutoff Prediction
              </Link>
            </li>
            <li>
              <Link href="/kcet" className="hover:text-blue-400 transition-colors">
                Option Entry Planner
              </Link>
            </li>
            <li>
              <Link href="/kcet" className="hover:text-blue-400 transition-colors">
                College Code Finder
              </Link>
            </li>
          </ul>
        </div>

        {/* Academic Resources */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">VTU Resources</h4>
          <ul className="flex flex-col gap-2 text-sm text-slate-400">
            <li>
              <Link href="/" className="hover:text-blue-400 transition-colors">
                Latest Announcements
              </Link>
            </li>
            <li>
              <Link href="/pdf" className="hover:text-blue-400 transition-colors">
                Semester Notes & Syllabus
              </Link>
            </li>
            <li>
              <Link href="/courses" className="hover:text-blue-400 transition-colors">
                Free & Premium Courses
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Contacts */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Info</h4>
          <ul className="flex flex-col gap-2 text-sm text-slate-400">
            <li>Email: support@eduyodha.com</li>
            <li>Office: Bangalore, Karnataka</li>
            <li>Made for Students in Karnataka 💛❤️</li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} EduYodha. All rights reserved. Cutoff trends are compiled from KEA official statistics.</p>
      </div>
    </footer>
  );
}
