import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { StandardError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, resumeData, targetRole, conversationHistory } = await req.json();

    if (!sessionId || !resumeData || !targetRole || !conversationHistory) {
      return StandardError(400, "Missing required payload keys");
    }

    // Immediately dispatch background job securely via local Redis Queue / Inngest Cloud
    await inngest.send({
      name: "interview/evaluate",
      data: {
        sessionId,
        resumeData,
        targetRole,
        conversationHistory
      }
    });

    return NextResponse.json({ success: true, message: 'Processing dispatched' });
  } catch (error) {
    logger.error(error);
    return StandardError(500, "Internal Trigger Error", error);
  }
}
