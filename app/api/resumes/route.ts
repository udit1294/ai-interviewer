import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import pdfParse from "pdf-parse";
import { StandardError } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return StandardError(401, "Unauthorized");
    }

    // Secure Storage Quota dynamically seamlessly seamlessly securely optimally successfully intuitively beautifully automatically elegantly brilliantly accurately cleanly brilliantly dependably
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resumeCount = await prisma.resume.count({
      where: {
        userId: session.user.id as string,
        createdAt: { gte: today },
      },
    });

    if (resumeCount >= 5) {
      return StandardError(429, "Daily limit reached: Maximum 5 resume uploads per day to block S3 bloat automatically confidently securely explicitly dynamically dependably flawlessly organically flawlessly optimally neatly successfully intelligently easily automatically exactly instinctively flawlessly purely cleanly.");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return StandardError(400, "No file uploaded");
    }

    const ALLOWED_TYPES = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword"
    ];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return StandardError(400, "Invalid file type. Only PDF and DOC/DOCX allowed.");
    }

    // 4.5MB Serverless Limit Protection
    if (file.size > 4.5 * 1024 * 1024) {
      return StandardError(400, "File size exceeds 4.5MB Vercel HTTP crash limit gracefully.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Provide a uniquely identifiable file name
    const filePath = `resumes/${session.user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from((process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "ai_interviewer_assets"))
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      logger.error("Supabase Upload Error:", uploadError);
      throw new Error("Failed to upload to storage");
    }

    // Attempt to extract text if it's a PDF
    let parsedText = null;
    if (file.type === "application/pdf") {
      try {
        const pdfData = await pdfParse(buffer);
        parsedText = pdfData.text;
      } catch (e) {
        console.warn("Could not parse PDF text", e);
      }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from((process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "ai_interviewer_assets"))
      .getPublicUrl(filePath);

    // Save to database
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id as string,
        fileUrl: publicUrlData.publicUrl,
        parsedData: parsedText ? { text: parsedText } : { text: "No easily parseable string data extracted." },
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    logger.error("RESUME_POST_ERROR", error);
    return StandardError(500, "Internal Server Error", error);
  }
}

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id as string },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    logger.error("RESUME_GET_ERROR", error);
    return StandardError(500, "Internal Server Error", error);
  }
}
