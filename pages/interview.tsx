/**
 * Interview Setup Page
 * Allows user to select role and optionally add job description
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ParsedResume } from '@/types/interview';
import RoleSelection from '@/components/RoleSelection';
import JobDescriptionInput from '@/components/JobDescriptionInput';

export default function InterviewPage() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [step, setStep] = useState<'role' | 'job-description' | 'ready'>('role');

  useEffect(() => {
    // Load resume data from session storage
    const stored = sessionStorage.getItem('resumeData');
    if (!stored) {
      router.push('/');
      return;
    }
    setResumeData(JSON.parse(stored));
  }, [router]);

  const handleRoleSelected = (role: string) => {
    setSelectedRole(role);
    setStep('job-description');
  };

  const handleJobDescriptionSubmit = (desc: string) => {
    setJobDescription(desc);
    setStep('ready');
  };

  const handleSkipJobDescription = () => {
    setJobDescription('');
    setStep('ready');
  };

  const handleStartInterview = async () => {
    const resumeId = sessionStorage.getItem('resumeId');
    if (!resumeId) {
      alert("Resume ID completely missing! Please upload your resume again.");
      return;
    }

    try {
      // Create Database Session securely
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId,
          role: selectedRole,
          difficultyLevel: 'MID', // Matches enum ['ENTRY', 'MID', 'SENIOR']
          maxQuestions: 5
        })
      });

      if (!res.ok) throw new Error("Failed to create Interview Session");
      const sessionData = await res.json();

      sessionStorage.setItem('sessionId', sessionData.id);

      // Store visual interview setup in session for quick reference
      sessionStorage.setItem(
        'interviewSetup',
        JSON.stringify({
          resumeData,
          targetRole: selectedRole,
          jobDescription,
        })
      );

      router.push(`/chat?sessionId=${sessionData.id}`);
    } catch (e) {
      console.error("Failed to jump into interview session:", e);
      alert("Failed to start session. Check console log.");
    }
  };

  const handleGoBack = () => {
    if (step === 'job-description') {
      setStep('role');
      setSelectedRole('');
    } else if (step === 'ready') {
      setStep('job-description');
    }
  };

  if (!resumeData) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Interview Setup</h1>
          <p className="text-gray-600">
            Welcome, {resumeData.name}! Let&apos;s set up your interview.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-between mb-8 max-w-2xl mx-auto">
          {['role', 'job-description', 'ready'].map((s, index) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${(step === 'role' && s === 'role') ||
                    (step === 'job-description' && (s === 'role' || s === 'job-description')) ||
                    (step === 'ready' && true)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-700'
                  }`}
              >
                {index + 1}
              </div>
              {index < 2 && (
                <div
                  className={`flex-1 h-1 mx-2 ${(step === 'job-description' && index === 0) ||
                      (step === 'ready' && index < 2)
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                    }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 'role' && <RoleSelection onRoleSelected={handleRoleSelected} />}

        {step === 'job-description' && (
          <JobDescriptionInput
            onJobDescriptionSubmit={handleJobDescriptionSubmit}
            onSkip={handleSkipJobDescription}
          />
        )}

        {step === 'ready' && (
          <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Start?</h2>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Candidate:</span> {resumeData.name}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Target Role:</span> {selectedRole}
                </p>
                {jobDescription && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Job Description:</span> Added ✓
                  </p>
                )}
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 font-semibold mb-2">Interview Details:</p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• You&apos;ll answer 5 interview questions</li>
                  <li>• Questions are tailored to your resume and role</li>
                  <li>• The AI will adapt based on your responses</li>
                  <li>• You&apos;ll get a detailed performance report at the end</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleGoBack}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition"
              >
                Back
              </button>
              <button
                onClick={handleStartInterview}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition flex-1"
              >
                Start Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
