import { z } from "zod";

export const createSessionSchema = z.object({
  resumeId: z.string().min(1, "Resume ID is required"),
  role: z.string().min(1, "Role is required"),
  company: z.string().optional(),
  jobDescription: z.string().optional(),
  difficultyLevel: z.enum(["ENTRY", "MID", "SENIOR"]).optional(),
  maxQuestions: z.number().optional(),
});

export const createResponseSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  questionNumber: z.number().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  score: z.number().optional(),
  feedback: z.string().optional(),
  responseTime: z.number().optional(),
});

export const createReportSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  technicalScore: z.number(),
  communicationScore: z.number(),
  problemSolvingScore: z.number(),
  confidenceScore: z.number(),
  overallScore: z.number(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  detailedFeedback: z.any().optional(),
  interviewerComments: z.string().optional(),
});

export const createRecordingSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  fileUrl: z.string().url("Must be a valid URL"),
  duration: z.number(),
  format: z.enum(["WEBM", "MP3", "WAV"]),
  fileSize: z.number().optional()
});
