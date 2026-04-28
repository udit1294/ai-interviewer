import React from "react";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

import RecordingPlayer from "@/components/RecordingPlayer";
import InterviewReport from "@/components/InterviewReport";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionAuth = await getAuthSession();
  if (!sessionAuth?.user) redirect("/login");

  const sessionData = await prisma.interviewSession.findFirst({
    where: { id: id, userId: sessionAuth.user.id },
    include: {
      evaluationReport: true,
      resume: true,
      recording: true,
    },
  });

  if (!sessionData || !sessionData.evaluationReport || !sessionData.resume) {
    return (
      <div className="p-12 text-center text-gray-500">
         No report generated for this session yet, or session not found.
      </div>
    );
  }

  // Synthesize legacy InterviewEvaluation object dynamically from Database format
  const mappedEvaluation = {
    technicalSkillsScore: sessionData.evaluationReport.technicalScore || 0,
    communicationScore: sessionData.evaluationReport.communicationScore || 0,
    problemSolvingScore: sessionData.evaluationReport.problemSolvingScore || 0,
    roleAlignmentScore: sessionData.evaluationReport.confidenceScore || 0,
    overallScore: sessionData.evaluationReport.overallScore || 0,
    strengths: sessionData.evaluationReport.strengths as string[] || [],
    weaknesses: sessionData.evaluationReport.weaknesses as string[] || [],
    recommendation: sessionData.evaluationReport.overallScore >= 7 ? 'Strong Hire' : sessionData.evaluationReport.overallScore >= 5 ? 'Hire' : 'No Hire', // Legacy strict string
    skillAssessments: (sessionData.evaluationReport.detailedFeedback as any)?.assessments || [],
    feedbackSummary: (sessionData.evaluationReport.detailedFeedback as any)?.summary || "No detail provided.",
    areasForImprovement: sessionData.evaluationReport.recommendations as string[] || [],
    interviewerNotes: sessionData.evaluationReport.interviewerComments || "",
  };

  // Reconstruct Secure Path using dynamic SignedUrl magically organically gracefully!
  let recordingUrl = null;
  if (sessionData.recording?.fileUrl) {
    if (sessionData.recording.fileUrl.startsWith('http')) {
      // Legacy compatibility for old recordings already uploaded publicly
      recordingUrl = sessionData.recording.fileUrl;
    } else {
      // Issue secure playback token dynamically!
      const { data } = await supabase.storage
         .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "ai_interviewer_assets")
         .createSignedUrl(sessionData.recording.fileUrl, 3600);
      recordingUrl = data?.signedUrl || null;
    }
  }

  return (
    <div>
      <RecordingPlayer url={recordingUrl} />
      <InterviewReport  
        candidateName={(sessionData.resume.parsedData as any).name || "Candidate"}
        targetRole={sessionData.role}
        evaluation={mappedEvaluation as any}
      />
    </div>
  );
}
