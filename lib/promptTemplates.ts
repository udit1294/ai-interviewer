/**
 * Prompt Templates for Interview Process
 * Contains all AI prompts used throughout the interview workflow
 */

import { ParsedResume } from '@/types/interview';

/**
 * Prompt for parsing resume into structured format
 */
export function getResumeParsingPrompt(resumeText: string): string {
  return `You are an expert resume parser. Extract the following structured information from the provided resume and return it ONLY as a valid JSON object (no markdown, no extra text). 

Resume content:
${resumeText}

Return a JSON object with EXACTLY this structure (use empty arrays/values if information is not present):
{
  "name": "string",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "skills": ["string array of skills"],
  "yearsOfExperience": number,
  "workExperience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string (e.g., 'Jan 2020 - Dec 2022')",
      "responsibilities": ["string array"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string array"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduationYear": "string or null"
    }
  ],
  "certifications": ["string array"]
}

Ensure all values are properly typed and no fields are missing. Return ONLY the JSON object.`;
}

/**
 * System prompt for interview question generation
 */
export function getInterviewSystemPrompt(
  role: string,
  resumeData: ParsedResume,
  jobDescription?: string
): string {
  // Determine question count based on experience level
  let questionCount = 4; // Default
  const yearsExp = resumeData.yearsOfExperience || 0;
  
  if (yearsExp < 2) {
    questionCount = 3; // Entry-level: 3 questions
  } else if (yearsExp >= 2 && yearsExp < 5) {
    questionCount = 4; // Mid-level: 4 questions
  } else {
    questionCount = 5; // Senior: 5 questions
  }

  return `You are a professional technical interviewer conducting an interview for the position of "${role}".

Candidate Information:
- Name: ${resumeData.name}
- Years of Experience: ${resumeData.yearsOfExperience}
- Key Skills: ${resumeData.skills.slice(0, 10).join(', ')}
- Recent Roles: ${resumeData.workExperience.slice(0, 2).map((w) => w.role).join(', ')}

${jobDescription ? `Job Description:\n${jobDescription}\n` : ''}

CRITICAL INSTRUCTION:
You will ask EXACTLY ${questionCount} questions in total during this interview. The candidate should NOT know the total number of questions. Determine when to conclude naturally based on the conversation flow.

Your role:
1. Ask ONE clear, focused interview question at a time
2. Ask follow-up questions to understand depth of knowledge and problem-solving approach
3. Tailor questions based on the candidate's resume and the target role
4. Progress from easier questions to more challenging ones
5. Focus on technical depth, real-world problem-solving, and project-based discussions
6. Maintain a professional and encouraging tone
7. Reference specific experiences from their resume when relevant
8. Evaluate both technical knowledge and soft skills (communication, problem-solving)

Guidelines:
- Keep questions concise and clear
- Allow the candidate to fully express their thoughts
- Ask "why" and "how" questions to assess depth
- Probe into specific projects and technologies mentioned in their resume
- Assess ability to handle edge cases and trade-offs
- Evaluate communication clarity and technical articulation

Always ask ONE question at a time and wait for the candidate's response before proceeding.

When you've asked all ${questionCount} questions and received responses, end with a brief closing statement like "Thank you for this interview. We appreciate your time and insights."`;
}

/**
 * Prompt for evaluating interview responses
 */
export function getEvaluationPrompt(
  role: string,
  resumeData: ParsedResume,
  conversationHistory: Array<{ role: string; content: string }>
): string {
  const conversationText = conversationHistory
    .map((msg) => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`)
    .join('\n\n');

  return `You are an expert technical interviewer and hiring manager. Evaluate the interview performance of a candidate for the position of "${role}".

Candidate Resume Summary:
- Name: ${resumeData.name}
- Years of Experience: ${resumeData.yearsOfExperience}
- Skills: ${resumeData.skills.join(', ')}

Interview Transcript:
${conversationText}

Provide a comprehensive evaluation in ONLY JSON format (no markdown, no extra text):
{
  "technicalSkillsScore": number (0-10),
  "communicationScore": number (0-10),
  "problemSolvingScore": number (0-10),
  "roleAlignmentScore": number (0-10),
  "overallScore": number (0-10),
  "strengths": ["string array of 3-5 strengths"],
  "weaknesses": ["string array of 2-4 areas to improve"],
  "recommendation": "Strong Hire|Hire|Maybe|No Hire",
  "skillAssessments": [
    {
      "category": "string (e.g., 'System Design', 'Problem Solving')",
      "score": number (0-10),
      "comments": "string assessment"
    }
  ],
  "feedbackSummary": "string (2-3 paragraph summary of performance)",
  "areasForImprovement": ["string array of specific areas to work on"],
  "interviewerNotes": "string (optional personal notes)"
}

Scoring guidance:
- 9-10: Exceptional, exceeds expectations
- 7-8: Strong, meets all requirements
- 5-6: Adequate, meets basic requirements
- 3-4: Below expectations, needs improvement
- 0-2: Poor, significant gaps

Ensure all values match their expected types. Return ONLY the JSON object.`;
}

/**
 * Prompt for generating follow-up questions
 */
export function getFollowUpQuestionPrompt(lastQuestion: string, lastResponse: string): string {
  return `Based on the interviewer's question and candidate's response, generate ONE thoughtful follow-up question that:
1. Digs deeper into their understanding
2. Asks about edge cases or alternative approaches
3. Probes their reasoning or problem-solving approach
4. References specific details they mentioned

Question asked: "${lastQuestion}"
Candidate's response: "${lastResponse}"

Generate a single, focused follow-up question that naturally continues the conversation. Ask only ONE question.`;
}

/**
 * Prompt for initial warm-up
 */
export function getWarmUpPrompt(candidateName: string, role: string): string {
  return `You are starting an interview with ${candidateName} for the position of ${role}. 

Begin with a warm, professional greeting and a brief overview of the interview process. Then ask ONE opening question to get to know them better - something like their background, what attracted them to this role, or a brief overview of their experience.

Keep it conversational and encouraging.`;
}

/**
 * Prompt for optionally refining/generating detailed narrative email feedback natively 
 */
export function getEmailRefinementPrompt(
  candidateName: string,
  role: string,
  overallScore: number,
  strengths: string[],
  weaknesses: string[],
  recommendations: string[]
): string {
  return `You are an expert technical recruiter analyzing an AI mock interview.
Review the following computed session metrics:
- Candidate Name: ${candidateName}
- Target Role: ${role}
- Overall AI Score: ${overallScore}/10
- Analyzed Strengths: ${strengths.join(", ")}
- Identified Weaknesses: ${weaknesses.join(", ")}
- Structured Recommendations: ${recommendations.join(", ")}

Write a highly personalized, empathetic, and professional 3-paragraph email summarizing their performance, praising their strengths, and offering actionable guidance on how they can improve their highlighted weaknesses before their real technical interview. Return ONLY the refined email text without any intro or JSON markers.`;
}

export default {
  getResumeParsingPrompt,
  getInterviewSystemPrompt,
  getEvaluationPrompt,
  getFollowUpQuestionPrompt,
  getWarmUpPrompt,
  getEmailRefinementPrompt,
};
