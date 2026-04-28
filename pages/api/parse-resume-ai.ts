import { logger } from "@/lib/logger";
/**
 * API Route: Parse Resume with AI
 * Sends extracted resume text to Gemini for structured parsing
 * POST /api/parse-resume-ai
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, ParsedResume } from '@/types/interview';
import { initializeAIClient, sendMessage, parseJSONResponse } from '@/lib/aiClient';
import { getResumeParsingPrompt } from '@/lib/promptTemplates';
import { validateParsedResume, normalizeParsedResume } from '@/lib/resumeParser';

interface RequestBody {
  resumeText: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ParsedResume>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { resumeText } = req.body as RequestBody;

    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid resumeText',
      });
    }

    // Initialize AI model
    const model = initializeAIClient();

    // Get parsing prompt
    const parsingPrompt = getResumeParsingPrompt(resumeText);

    // Send parsing request to Gemini
    const response = await sendMessage(
      model,
      [{ role: 'user', content: parsingPrompt }],
      'You are an expert resume parser. Extract and structure resume information accurately.'
    );

    // Parse JSON response
    let parsedData = parseJSONResponse(response);

    // Validate and normalize
    if (!validateParsedResume(parsedData)) {
      // Try to fix common issues
      parsedData = {
        name: parsedData.name || 'Unknown',
        skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
        workExperience: Array.isArray(parsedData.workExperience) ? parsedData.workExperience : [],
        projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
        education: Array.isArray(parsedData.education) ? parsedData.education : [],
        certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : [],
        yearsOfExperience: Number(parsedData.yearsOfExperience) || 0,
      };
    }

    const normalizedResume = normalizeParsedResume(parsedData);

    return res.status(200).json({
      success: true,
      data: normalizedResume,
    });
  } catch (error) {
    logger.error('Error parsing resume with AI:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse resume',
    });
  }
}
