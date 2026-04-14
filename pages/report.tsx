/**
 * Report Page
 * Displays final interview report
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InterviewEvaluation, ParsedResume } from '@/types/interview';
import InterviewReport from '@/components/InterviewReport';

export default function ReportPage() {
  const router = useRouter();
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load evaluation and setup from session storage
    const evaluationStored = sessionStorage.getItem('evaluation');
    const setupStored = sessionStorage.getItem('interviewSetup');

    if (!evaluationStored || !setupStored) {
      router.push('/');
      return;
    }

    const evaluation = JSON.parse(evaluationStored);
    const setup = JSON.parse(setupStored);

    setEvaluation(evaluation);
    setResumeData(setup.resumeData);
    setTargetRole(setup.targetRole);
    setIsLoading(false);
  }, [router]);

  const handleRestart = () => {
    // Clear session storage
    sessionStorage.removeItem('resumeData');
    sessionStorage.removeItem('interviewSetup');
    sessionStorage.removeItem('evaluation');
    // Redirect to home
    router.push('/');
  };

  if (isLoading || !evaluation || !resumeData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <InterviewReport
        candidateName={resumeData.name}
        targetRole={targetRole}
        evaluation={evaluation}
        onRestart={handleRestart}
        recordedChunks={recordedChunks}
      />
    </main>
  );
}
