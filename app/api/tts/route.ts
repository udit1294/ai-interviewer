import { logger } from "@/lib/logger";
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAuthSession } from '@/lib/auth';
import { StandardError } from '@/lib/api-response';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return StandardError(401, "Unauthorized access blocked natively.");

    const { text } = await req.json();

    if (!text) {
      return StandardError(400, "Text is required explicitly by TTS engine");
    }

    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY identically mathematically missing natively");
      return StandardError(500, "TTS API Key elegantly missing");
    }

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    // Native array buffer stream manipulation 
    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    logger.error('Error generating mathematically correct audio natively:', error);
    return StandardError(500, "Internal Server Error", error);
  }
}
