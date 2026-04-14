/**
 * API Route: Generate Interview Questions
 * Generates AI-powered interview questions based on resume and role
 * POST /api/generate-questions
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, InterviewQuestion, ConversationMessage, ParsedResume } from '@/types/interview';
import { initializeAIClient, sendMessage, parseJSONResponse } from '@/lib/aiClient';
import { getInterviewSystemPrompt, getWarmUpPrompt } from '@/lib/promptTemplates';

interface RequestBody {
  resumeData: ParsedResume;
  targetRole: string;
  jobDescription?: string;
  conversationHistory: ConversationMessage[];
  isFirstQuestion?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ question: string; questionId: string }>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { resumeData, targetRole, jobDescription, conversationHistory, isFirstQuestion } =
      req.body as RequestBody;

    // Validate input
    if (!resumeData || !targetRole) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: resumeData and targetRole',
      });
    }

    // Initialize AI model
    const model = initializeAIClient();

    let systemPrompt: string;
    let userMessage: string;

    if (isFirstQuestion) {
      // First question - warm up
      systemPrompt = getWarmUpPrompt(resumeData.name, targetRole);
      userMessage = 'Please start the interview';
    } else {
      // Subsequent questions
      systemPrompt = getInterviewSystemPrompt(targetRole, resumeData, jobDescription);
      
      // Convert conversation history to Gemini format
      const messages = conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      userMessage = 'Please ask the next interview question.';

      // Send message to Gemini with conversation history
      const response = await sendMessage(model, messages, systemPrompt);

      return res.status(200).json({
        success: true,
        data: {
          question: response,
          questionId: `q_${Date.now()}`,
        },
      });
    }

    // For first question, use a simpler request
    const response = await sendMessage(model, [{ role: 'user', content: userMessage }], systemPrompt);

    return res.status(200).json({
      success: true,
      data: {
        question: response,
        questionId: `q_${Date.now()}`,
      },
    });
  } catch (error) {
    console.error('Error generating question:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate question',
    });
  }
}
