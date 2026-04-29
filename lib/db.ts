/**
 * Database Utilities
 * 
 * Common database operations and helper functions for the AI Interviewer
 */

import { prisma } from './prisma';
import { Prisma } from '@prisma/client';

/**
 * Get or create a user
 */
export async function getOrCreateUser(email: string, name?: string) {
  return await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: name || email.split('@')[0],
      password: '', // Should be hashed if needed
    },
  });
}

/**
 * Create a new interview session
 */
export async function createInterviewSession(data: {
  userId: string;
  resumeId: string;
  role: string;
  company?: string;
  jobDescription?: string;
  difficultyLevel?: 'ENTRY' | 'MID' | 'SENIOR';
  maxQuestions?: number;
}) {
  return await prisma.interviewSession.create({
    data: {
      ...data,
      status: 'IN_PROGRESS',
    },
  });
}

/**
 * Save a question response
 */
export async function saveQuestionResponse(data: {
  sessionId: string;
  questionNumber: number;
  question: string;
  answer: string;
  score?: number;
  feedback?: string;
  responseTime?: number;
}) {
  return await prisma.questionResponse.create({
    data,
  });
}

/**
 * Complete interview session
 */
export async function completeInterviewSession(
  sessionId: string,
  data: {
    endedAt?: Date;
    totalDuration?: number;
    overallScore?: number;
    feedbackSummary?: string;
  }
) {
  return await prisma.interviewSession.update({
    where: { id: sessionId },
    data: {
      ...data,
      status: 'COMPLETED',
      endedAt: data.endedAt || new Date(),
    },
  });
}

/**
 * Save interview recording
 */
export async function saveRecording(data: {
  sessionId: string;
  fileUrl: string;
  duration: number;
  format?: 'WEBM' | 'MP3' | 'WAV';
  fileSize?: number;
}) {
  return await prisma.recording.create({
    data: {
      ...data,
      format: data.format || 'WEBM',
    },
  });
}

/**
 * Create evaluation report
 */
export async function createEvaluationReport(data: {
  sessionId: string;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback?: Prisma.InputJsonValue;
  interviewerComments?: string;
}) {
  return await prisma.evaluationReport.create({
    data,
  });
}

/**
 * Get user's interview history
 */
export async function getUserInterviewHistory(userId: string) {
  return await prisma.interviewSession.findMany({
    where: { userId },
    include: {
      resume: true,
      evaluationReport: true,
      recording: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get full interview details
 */
export async function getInterviewDetails(sessionId: string) {
  return await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      resume: true,
      questionResponses: {
        orderBy: { questionNumber: 'asc' },
      },
      recording: true,
      evaluationReport: true,
    },
  });
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      resumes: true,
      interviewSessions: {
        include: { evaluationReport: true },
      },
    },
  });
}

/**
 * Save resume
 */
export async function saveResume(data: {
  userId: string;
  fileUrl: string;
  parsedData?: Prisma.InputJsonValue;
}) {
  return await prisma.resume.create({
    data,
  });
}

/**
 * Get user's resumes
 */
export async function getUserResumes(userId: string) {
  return await prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Delete interview session and all related data (cascade delete)
 */
export async function deleteInterviewSession(sessionId: string) {
  return await prisma.interviewSession.delete({
    where: { id: sessionId },
  });
}

/**
 * Get statistics for a user
 */
export async function getUserStatistics(userId: string) {
  const sessions = await prisma.interviewSession.findMany({
    where: { userId },
    include: { evaluationReport: true },
  });

  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');

  if (completedSessions.length === 0) {
    return {
      totalInterviews: 0,
      completedInterviews: 0,
      averageScore: 0,
      bestScore: 0,
      recentInterviews: [],
    };
  }

  const scores = completedSessions
    .map((s) => s.evaluationReport?.overallScore || 0)
    .filter((s) => s > 0);

  return {
    totalInterviews: sessions.length,
    completedInterviews: completedSessions.length,
    averageScore:
      scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
    recentInterviews: completedSessions.slice(0, 5),
  };
}

export default {
  getOrCreateUser,
  createInterviewSession,
  saveQuestionResponse,
  completeInterviewSession,
  saveRecording,
  createEvaluationReport,
  getUserInterviewHistory,
  getInterviewDetails,
  getUserByEmail,
  saveResume,
  getUserResumes,
  deleteInterviewSession,
  getUserStatistics,
};
