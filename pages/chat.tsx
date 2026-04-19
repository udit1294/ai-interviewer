/**
 * Chat/Interview Page
 * Displays the actual interview chat interface
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ParsedResume, InterviewEvaluation } from '@/types/interview';
import ChatInterview from '@/components/ChatInterview';

export default function ChatPage() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
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
    // Async flow — just redirect to dashboard; Inngest handles evaluation in background
    router.push('/dashboard');
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
