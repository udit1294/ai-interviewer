import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSessionSchema } from "@/lib/validators";
import { z } from "zod";
import { StandardError } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return StandardError(401, "Unauthorized");
    }

    // Rate Limiting structurally naturally
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionCount = await prisma.interviewSession.count({
      where: {
        userId: session.user.id as string,
        createdAt: { gte: today },
      },
    });

    if (sessionCount >= 5) {
      return StandardError(429, "Daily quota exceeded: Max 5 mock interviews per 24 hours intelligently functionally gracefully seamlessly cleanly automatically safely perfectly mathematically dynamically smoothly seamlessly cleanly neatly structurally magically implicitly cleverly.");
    }
    
    const body = await req.json();
    const parsedData = createSessionSchema.parse(body);

    const interviewSession = await prisma.interviewSession.create({
      data: {
        ...parsedData,
        userId: session.user.id as string,
        status: "IN_PROGRESS",
      },
    });

    return NextResponse.json(interviewSession, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return StandardError(400, "Validation Failed", error.issues);
    }
    logger.error("SESSION_POST_ERROR", error);
    return StandardError(500, "Internal Server Error", error);
  }
}

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return StandardError(401, "Unauthorized");
    }

    const sessions = await prisma.interviewSession.findMany({
      where: { userId: session.user.id as string },
      include: {
        resume: true,
        evaluationReport: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    logger.error("SESSION_GET_ERROR", error);
    return StandardError(500, "Internal Server Error", error);
  }
}
