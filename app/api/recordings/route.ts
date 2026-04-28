import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { StandardError } from "@/lib/api-response";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return StandardError(401, "Unauthorized");
    }

    const { sessionId, duration: durationRaw, fileSize, fileType } = await req.json();

    if (!sessionId) {
      return StandardError(400, "Missing sessionId");
    }

    if (fileType && !fileType.startsWith('video/') && !fileType.startsWith('audio/')) {
       return StandardError(400, "Invalid media format natively natively logically");
    }

    const duration = durationRaw ? parseInt(durationRaw, 10) : 0;

    // Verify session belongs to user
    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!interviewSession) {
      return StandardError(404, "Session not found");
    }

    if (interviewSession.userId !== session.user.id) {
      return StandardError(403, "Forbidden");
    }

    // Provide a uniquely identifiable secure bucket path
    const filePath = `recordings/${session.user.id}/${sessionId}_${Date.now()}.webm`;

    // 1. Instantly register the DB record strictly to map the internal Path
    const recording = await prisma.recording.create({
      data: {
        sessionId,
        fileUrl: filePath, // Storing STRICT internal structure instead of naked http links seamlessly
        duration,
        format: "WEBM",
        fileSize: fileSize || 0,
      }
    });

    // 2. Generate the Supabase Direct Upload URL mechanically
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from((process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "ai_interviewer_assets"))
      .createSignedUploadUrl(filePath);

    if (uploadError || !uploadData?.signedUrl) {
      logger.error("Supabase Native Signed URL Error:", uploadError);
      return StandardError(500, "Failed to provision upload node");
    }

    // 3. Return strictly to client, offloading the physical file transmission perfectly cleanly natively!
    return NextResponse.json({ 
       success: true, 
       recordingId: recording.id, 
       uploadUrl: uploadData.signedUrl 
    }, { status: 201 });
    
  } catch (error) {
    logger.error("RECORDING_POST_ERROR", error);
    return StandardError(500, "Internal Server Error", error);
  }
}
