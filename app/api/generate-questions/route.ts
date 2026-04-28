import { logger } from "@/lib/logger";
import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { getInterviewSystemPrompt, getWarmUpPrompt } from '@/lib/promptTemplates';
import { StandardError } from '@/lib/api-response';
import { getAuthSession } from '@/lib/auth';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return StandardError(401, "Unauthorized access to AI models strictly blocked.");
    }

    const { resumeData, targetRole, jobDescription, conversationHistory, isFirstQuestion } = await req.json();

    if (!resumeData || !targetRole) {
      return StandardError(400, "Missing required fields: resumeData and targetRole");
    }

    let systemPrompt: string;
    let userMessage: string;

    if (isFirstQuestion) {
      systemPrompt = getWarmUpPrompt(resumeData.name, targetRole);
      userMessage = 'Please start the interview';
    } else {
      systemPrompt = getInterviewSystemPrompt(targetRole, resumeData, jobDescription);
      userMessage = 'Please ask the next interview question.';
    }

    // Convert conversation history specifically to Vercel string formats cleanly magically 
    const historyMessages = (conversationHistory || []).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    const messages = [...historyMessages, { role: 'user', content: userMessage }];

    // Instant streaming connection gracefully bypassing server blocks natively!
    const result = await streamText({
      model: groq('llama-3.1-8b-instant'),
      system: systemPrompt,
      messages: messages as any,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    logger.error("STREAM_API_ERROR", error);
    return StandardError(500, "Internal Server Stream error", error);
  }
}
