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
  const { sessionId } = router.query;
  const [session, setSession] = useState<any>(null);
  
  useEffect(() => {
    if (!sessionId) return; // Wait for router to be ready
    
    // 1. Ditch sessionStorage. Fetch directly from the DB!
    const fetchSessionData = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (!res.ok) throw new Error("Failed to load session");
        
        const dbSession = await res.json();
        setSession(dbSession);
      } catch (e) {
        // Fallback: unauthorized or invalid session
        router.push('/dashboard'); 
      }
    };
    
    fetchSessionData();
  }, [sessionId, router]);

  const handleInterviewComplete = (evaluation: InterviewEvaluation) => {
    // Async flow — just redirect to dashboard; Inngest handles evaluation in background
    router.push('/dashboard');
  };

  if (!session) {
    return <div className="flex items-center justify-center min-h-screen text-gray-600">Loading securely from database...</div>;
  }

  // Map the raw DB struct safely to the expected UI prop
  const structuredResumeFallback = {
    name: "Candidate",
    email: undefined,
    phone: undefined,
    location: undefined,
    skills: [] as string[],
    yearsOfExperience: session.difficultyLevel === 'ENTRY' ? 1 : session.difficultyLevel === 'MID' ? 3 : 5,
    workExperience: [] as any[],
    projects: [] as any[],
    education: [] as any[],
    certifications: [] as string[],
    text: session.resume?.parsedData?.text || ""
  };

  return (
    <ChatInterview
      resumeData={structuredResumeFallback as ParsedResume} 
      targetRole={session.role}
      jobDescription={session.jobDescription || ''}
      onInterviewComplete={handleInterviewComplete}
    />
  );
}
