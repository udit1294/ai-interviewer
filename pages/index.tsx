/**
 * Home/Index Page
 * Landing page with resume upload
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ParsedResume } from '@/types/interview';
import ResumeUpload from '@/components/ResumeUpload';

export default function Home() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResumeLoaded = async (resume: ParsedResume) => {
    setIsLoading(true);
    setResumeData(resume);

    // Store resume data in session/localStorage for next page
    sessionStorage.setItem('resumeData', JSON.stringify(resume));

    // Redirect to interview setup page
    setTimeout(() => {
      router.push('/interview');
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            AI Interviewer
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Practice interviews with artificial intelligence
          </p>
          <p className="text-gray-500">
            Get personalized feedback and improve your interview skills
          </p>
        </div>

        {/* Resume Upload Component */}
        <ResumeUpload onResumeLoaded={handleResumeLoaded} isLoading={isLoading} />

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '📄',
              title: 'Smart Resume Analysis',
              description: 'Upload your resume and let AI analyze your skills and experience',
            },
            {
              icon: '💬',
              title: 'Interactive Interview',
              description: 'Answer contextual questions tailored to your role and background',
            },
            {
              icon: '📊',
              title: 'Detailed Feedback',
              description: 'Get comprehensive performance report with actionable insights',
            },
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-4xl mb-3">{feature.icon}</p>
              <h3 className="font-bold text-lg text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
