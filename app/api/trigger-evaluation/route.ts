import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, resumeData, targetRole, conversationHistory } = await req.json();

    if (!sessionId || !resumeData || !targetRole || !conversationHistory) {
      return NextResponse.json({ success: false, error: 'Missing required payload keys' }, { status: 400 });
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
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Trigger Error' }, { status: 500 });
  }
}
