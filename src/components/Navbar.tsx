'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Menu, X, Star, BookOpen, GraduationCap, FileText, LayoutDashboard, LogIn, LogOut, Award } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [user, setUser] = useState<{ name: string; role: string; isPro: boolean } | null>(null);

  useEffect(() => {
    // Theme sync
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');

    // Simple local auth state sync
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }

    // Custom event to listen to user updates (like login/logout/pro unlock)
    const handleUserChange = () => {
      const updatedUser = localStorage.getItem('user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener('user-state-change', handleUserChange);
    return () => window.removeEventListener('user-state-change', handleUserChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('user-state-change'));
    window.location.href = '/';
  };

  const links = [
    { href: '/', label: 'Home', icon: BookOpen },
    { href: '/kcet', label: 'KCET Predictor', icon: Award },
    { href: '/courses', label: 'Courses', icon: GraduationCap },
    { href: '/pdf', label: 'PDF Store', icon: FileText },
    { href: '/blog', label: 'Blogs', icon: Star },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl animate-pulse">🛡️</span>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 bg-clip-text text-transparent">
              EduYodha
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 -mt-1 tracking-wider uppercase">
              Learn Smart. Achieve More.
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={14} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-amber-500 text-white text-sm font-bold shadow-md shadow-amber-500/10 hover:bg-amber-600 transition-all"
            >
              <LayoutDashboard size={14} />
              <span>Admin Panel</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {user.name} {user.isPro && '👑'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 text-slate-600 dark:text-slate-300 text-sm font-bold transition-all cursor-pointer"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              <LogIn size={14} />
              <span>Login</span>
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-300 animate-slide-in">
          <div className="flex flex-col p-4 gap-3">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

            {user?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold shadow-md shadow-amber-500/10"
              >
                <LayoutDashboard size={16} />
                <span>Admin Panel</span>
              </Link>
            )}

            {user ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold p-2 text-slate-500">
                  Logged in as {user.name} {user.isPro ? '👑' : ''}
                </span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-500/15"
              >
                <LogIn size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
