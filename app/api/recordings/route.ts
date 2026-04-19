import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRecordingSchema } from "@/lib/validators";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const sessionId = formData.get("sessionId") as string;
    const durationStr = formData.get("duration") as string;
    const file = formData.get("file") as File | null;

    if (!sessionId || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const duration = durationStr ? parseInt(durationStr, 10) : 0;

    // Verify session belongs to user
    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (interviewSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Provide a uniquely identifiable file name
    const filePath = `recordings/${session.user.id}/${sessionId}_${Date.now()}.webm`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from((process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "ai_interviewer_assets"))
      .upload(filePath, buffer, {
        contentType: file.type || 'audio/webm',
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      throw new Error("Failed to upload recording to storage");
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from((process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "ai_interviewer_assets"))
      .getPublicUrl(filePath);

    const recording = await prisma.recording.create({
      data: {
        sessionId,
        fileUrl: publicUrlData.publicUrl,
        duration,
        format: "WEBM",
        fileSize: file.size,
      }
    });

    return NextResponse.json(recording, { status: 201 });
  } catch (error) {
    console.error("RECORDING_POST_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
