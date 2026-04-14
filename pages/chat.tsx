/**
 * Chat/Interview Page
 * Displays the actual interview chat interface
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ParsedResume, InterviewEvaluation } from '@/types/interview';
import ChatInterview from '@/components/ChatInterview';

export default function ChatPage() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load interview setup from session storage
    const stored = sessionStorage.getItem('interviewSetup');
    if (!stored) {
      router.push('/');
      return;
    }

    const setup = JSON.parse(stored);
    setResumeData(setup.resumeData);
    setTargetRole(setup.targetRole);
    setJobDescription(setup.jobDescription || '');
    setIsLoading(false);
  }, [router]);

  const handleInterviewComplete = (evaluation: InterviewEvaluation) => {
    setEvaluation(evaluation);
    // Store evaluation in session
    sessionStorage.setItem('evaluation', JSON.stringify(evaluation));
    // Redirect to report page
    setTimeout(() => {
      router.push('/report');
    }, 1000);
  };

  if (isLoading || !resumeData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <ChatInterview
      resumeData={resumeData}
      targetRole={targetRole}
      jobDescription={jobDescription}
      onInterviewComplete={handleInterviewComplete}
    />
  );
}
