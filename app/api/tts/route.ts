import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required explicitly by TTS engine' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY identically mathematically missing natively");
      return NextResponse.json({ error: 'TTS API Key elegantly missing' }, { status: 500 });
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
    console.error('Error generating mathematically correct audio natively:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
