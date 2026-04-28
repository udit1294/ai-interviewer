import { logger } from "@/lib/logger";
/**
 * API Route: Evaluate Interview
 * Evaluates candidate responses and generates a comprehensive assessment
 * POST /api/evaluate-interview
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, InterviewEvaluation, ConversationMessage, ParsedResume } from '@/types/interview';
import { initializeAIClient, sendMessage, parseJSONResponse } from '@/lib/aiClient';
import { getEvaluationPrompt } from '@/lib/promptTemplates';

interface RequestBody {
  resumeData: ParsedResume;
  targetRole: string;
  conversationHistory: ConversationMessage[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<InterviewEvaluation>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { resumeData, targetRole, conversationHistory } = req.body as RequestBody;

    // Validate input
    if (!resumeData || !targetRole || !conversationHistory) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Initialize AI model
    const model = initializeAIClient();

    // Get evaluation prompt
    const evaluationPrompt = getEvaluationPrompt(
      targetRole,
      resumeData,
      conversationHistory
    );

    // Send evaluation request to Gemini
    const response = await sendMessage(
      model,
      [{ role: 'user', content: evaluationPrompt }],
      'You are an expert technical hiring manager. Provide evaluations in JSON format only.'
    );

    // Parse JSON response
    const evaluation = parseJSONResponse(response) as InterviewEvaluation;

    // Format and Ensure response defaults exist safely
    evaluation.technicalSkillsScore = evaluation.technicalSkillsScore || 0;
    evaluation.communicationScore = evaluation.communicationScore || 0;
    evaluation.problemSolvingScore = evaluation.problemSolvingScore || 0;
    evaluation.overallScore = evaluation.overallScore || 0;
    evaluation.roleAlignmentScore = evaluation.roleAlignmentScore || 0;
    evaluation.recommendation = evaluation.recommendation || 'No Hire';
    evaluation.strengths = evaluation.strengths || [];
    evaluation.weaknesses = evaluation.weaknesses || [];

    return res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    logger.error('Error evaluating interview:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to evaluate interview',
    });
  }
}
