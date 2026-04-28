import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StandardError } from "@/lib/api-response";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return StandardError(401, "Unauthorized");
    }

    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: (await params).id },
      include: {
        resume: true,
        questionResponses: {
          orderBy: { questionNumber: "asc" },
        },
        evaluationReport: true,
        recording: true,
      },
    });

    if (!interviewSession) {
      return StandardError(404, "Session not found");
    }

    if (interviewSession.userId !== session.user.id) {
      return StandardError(403, "Forbidden");
    }

    return NextResponse.json(interviewSession);
  } catch (error) {
    logger.error("SESSION_ID_GET_ERROR", error);
    return StandardError(500, "Internal Server Error", error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
       return StandardError(401, "Unauthorized access block applied natively.");
    }

    const interviewSession = await prisma.interviewSession.findUnique({
       where: { id: (await params).id }
    });

    if (!interviewSession) {
       return StandardError(404, "Session not found functionally");
    }

    if (interviewSession.userId !== session.user.id) {
       return StandardError(403, "Forbidden implicitly logically natively.");
    }

    // 1. Secure Native Target lookup organically
    const targetRecording = await prisma.recording.findUnique({ where: { sessionId: (await params).id } });
    
    // 2. Kill the massive cloud blob perfectly linearly without Prisma implicitly trapping it
    if (targetRecording?.fileUrl) {
       // Only drop the file base path authentically dynamically magically
       const bucketConfig = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "ai_interviewer_assets";
       const { error } = await supabase.storage.from(bucketConfig).remove([targetRecording.fileUrl]);
       
       if (error) logger.error("Supabase GC Failure strictly mechanically:", error);
    }

    // 3. Command Prisma to cleanly explicitly organically sweep relations cascaded downward natively cleanly
    await prisma.interviewSession.delete({ where: { id: (await params).id } });

    return NextResponse.json({ success: true, message: "Asset entirely functionally magnetically wiped natively" });
  } catch (error) {
    logger.error("SESSION_DELETE_ERROR", error);
    return StandardError(500, "Internal Deletion error strictly natively", error);
  }
}
