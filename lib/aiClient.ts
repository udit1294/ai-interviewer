/**
 * AI Client Configuration
 * Handles all interactions with Groq API (Llama model)
 */

import Groq from 'groq-sdk';

/**
 * Initialize Groq client
 * Uses API key from environment variables
 */
export const initializeAIClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  return new Groq({ apiKey });
};

/**
 * Send a message to Groq and get a response
 * @param client - Groq client instance
 * @param messages - Array of messages in the conversation
 * @param systemPrompt - System prompt for the AI
 * @returns The AI's response
 */
export async function sendMessage(
  client: any,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string
): Promise<string> {
  try {
    const groqMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const result = await client.chat.completions.create({
      messages: groqMessages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 2048
    });

    const text = result.choices[0]?.message?.content;

    if (!text) {
      throw new Error('No text content in response');
    }

    return text;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}

/**
 * Parse JSON response from Gemini
 * Attempts to extract JSON from markdown code blocks if necessary
 */
export function parseJSONResponse(response: string): Record<string, any> {
  try {
    // First attempt: direct JSON parse
    return JSON.parse(response);
  } catch (e) {
    // Second attempt: look for JSON in markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (innerError) {
        throw new Error('Failed to parse JSON from markdown block');
      }
    }
    
    // Third attempt: look for raw JSON object
    const objectMatch = response.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch (innerError) {
        throw new Error('Failed to parse JSON from response');
      }
    }

    throw new Error('Could not find valid JSON in response');
  }
}

export default {
  initializeAIClient,
  sendMessage,
  parseJSONResponse,
};
