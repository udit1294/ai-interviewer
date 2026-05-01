/**
 * Home/Index Page
 * Landing page with resume upload and profile avatar
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { ParsedResume } from '@/types/interview';
import ResumeUpload from '@/components/ResumeUpload';

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResumeLoaded = async (resume: ParsedResume, resumeId: string) => {
    setIsLoading(true);
    sessionStorage.setItem('resumeData', JSON.stringify(resume));
    sessionStorage.setItem('resumeId', resumeId);
    setTimeout(() => {
      router.push('/interview');
    }, 1500);
  };

  // Get user initials for fallback avatar
  const getInitials = () => {
    const name = session?.user?.name || session?.user?.email || 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col p-4">

      {/* Top Navigation Bar */}
      <nav className="w-full max-w-6xl mx-auto flex items-center justify-between py-4 px-2">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">AI Interviewer</span>
        </div>

        {/* Right side — profile or login */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              {/* Dashboard link */}
              <button
                onClick={() => router.push('/dashboard')}
                className="hidden sm:flex items-center gap-1.5 text-blue-300 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Dashboard
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full pl-2 pr-3 py-1.5 transition-all duration-200 group"
                  aria-label="User menu"
                >
                  {/* Avatar */}
                  <div className="relative">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'Profile'}
                        width={28}
                        height={28}
                        className="rounded-full ring-2 ring-blue-400/50"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-400/50">
                        {getInitials()}
                      </div>
                    )}
                    {/* Online dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-900"></span>
                  </div>

                  {/* Name */}
                  <span className="text-white text-sm font-medium max-w-[100px] truncate hidden sm:block">
                    {session.user?.name?.split(' ')[0] || 'You'}
                  </span>

                  {/* Chevron */}
                  <svg
                    className={`w-3.5 h-3.5 text-blue-300 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-slate-800/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        {session.user?.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || 'Profile'}
                            width={36}
                            height={36}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                            {getInitials()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{session.user?.name || 'User'}</p>
                          <p className="text-blue-300 text-xs truncate">{session.user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5">
                      <button
                        onClick={() => { setDropdownOpen(false); router.push('/dashboard'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-white/10 transition-colors duration-150"
                      >
                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                        </svg>
                        My Dashboard
                      </button>

                      <button
                        onClick={() => { setDropdownOpen(false); router.push('/'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-white/10 transition-colors duration-150"
                      >
                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Interview
                      </button>
                    </div>

                    {/* Sign out */}
                    <div className="p-1.5 border-t border-white/10">
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="text-sm font-medium text-blue-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-full transition-all duration-200"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl">

          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-1.5 text-blue-300 text-sm font-medium mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              Powered by Groq AI
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4 tracking-tight">
              AI Interviewer
            </h1>
            <p className="text-xl text-blue-200 mb-2">
              Practice interviews with artificial intelligence
            </p>
            <p className="text-slate-400">
              Get personalized feedback and improve your interview skills
            </p>
          </div>

          {/* Upload card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-1 shadow-2xl shadow-black/30">
            <ResumeUpload onResumeLoaded={handleResumeLoaded} isLoading={isLoading} />
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '📄', title: 'Smart Resume Analysis', description: 'AI analyzes your skills and experience' },
              { icon: '💬', title: 'Interactive Interview', description: 'Contextual questions for your role' },
              { icon: '📊', title: 'Detailed Feedback', description: 'Comprehensive report with insights' },
            ].map((feature, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-5 text-center hover:bg-white/10 transition-colors duration-200">
                <p className="text-3xl mb-2">{feature.icon}</p>
                <h3 className="font-semibold text-white text-sm mb-1">{feature.title}</h3>
                <p className="text-slate-400 text-xs">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
