import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReportSchema } from "@/lib/validators";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = createReportSchema.parse(body);

    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: parsedData.sessionId },
      select: { userId: true },
    });

    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (interviewSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if report already exists
    const existingReport = await prisma.evaluationReport.findUnique({
      where: { sessionId: parsedData.sessionId },
    });

    if (existingReport) {
      return NextResponse.json({ error: "Evaluation report already exists for this session" }, { status: 409 });
    }

    const evaluationReport = await prisma.evaluationReport.create({
      data: parsedData,
    });

    // Also mark the session as COMPLETED and save overall score
    await prisma.interviewSession.update({
      where: { id: parsedData.sessionId },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
        overallScore: parsedData.overallScore,
      },
    });

    return NextResponse.json(evaluationReport, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    logger.error("REPORT_POST_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
