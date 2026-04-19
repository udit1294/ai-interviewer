import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import pdfParse from "pdf-parse";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const ALLOWED_TYPES = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword"
    ];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only PDF and DOC/DOCX allowed." }, { status: 400 });
    }
    
    // 5MB Limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
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
      console.error("Supabase Upload Error:", uploadError);
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
    console.error("RESUME_POST_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
    console.error("RESUME_GET_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
