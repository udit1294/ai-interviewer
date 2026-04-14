/**
 * API Route: Generate Report
 * Generates a comprehensive PDF report of the interview results
 * POST /api/generate-report
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, InterviewEvaluation, InterviewSession } from '@/types/interview';

interface RequestBody {
  evaluation: InterviewEvaluation;
  sessionData: InterviewSession;
}

interface ReportData {
  candidateName: string;
  targetRole: string;
  interviewDate: string;
  overallScore: number;
  recommendation: string;
  technicalSkillsScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  roleAlignmentScore: number;
  strengths: string[];
  weaknesses: string[];
  areasForImprovement: string[];
  feedbackSummary: string;
  duration: number;
  questionCount: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ reportData: ReportData }>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { evaluation, sessionData } = req.body as RequestBody;

    // Validate input
    if (!evaluation || !sessionData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: evaluation and sessionData',
      });
    }

    // Calculate interview duration
    const startTime = new Date(sessionData.startedAt);
    const endTime = sessionData.completedAt ? new Date(sessionData.completedAt) : new Date();
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    // Prepare report data
    const reportData: ReportData = {
      candidateName: sessionData.resumeData.name,
      targetRole: sessionData.targetRole,
      interviewDate: new Date(sessionData.startedAt).toLocaleDateString(),
      overallScore: evaluation.overallScore,
      recommendation: evaluation.recommendation,
      technicalSkillsScore: evaluation.technicalSkillsScore,
      communicationScore: evaluation.communicationScore,
      problemSolvingScore: evaluation.problemSolvingScore,
      roleAlignmentScore: evaluation.roleAlignmentScore,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      areasForImprovement: evaluation.areasForImprovement,
      feedbackSummary: evaluation.feedbackSummary,
      duration: durationMinutes,
      questionCount: sessionData.questions.length,
    };

    return res.status(200).json({
      success: true,
      data: { reportData },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate report',
    });
  }
}
