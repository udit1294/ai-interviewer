/**
 * Database Types
 * 
 * Type definitions for database models and operations
 * Generated from Prisma schema
 */

// Enums for database
export enum InterviewStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export enum DifficultyLevel {
  ENTRY = 'ENTRY',
  MID = 'MID',
  SENIOR = 'SENIOR',
}

export enum RecordingFormat {
  WEBM = 'WEBM',
  MP3 = 'MP3',
  WAV = 'WAV',
}

// Base types before Prisma generation
export interface User {
  id: string;
  email: string;
  name?: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resume {
  id: string;
  userId: string;
  fileUrl: string;
  parsedData?: Record<string, any>;
  createdAt: Date;
}

export interface InterviewSession {
  id: string;
  userId: string;
  resumeId: string;
  role: string;
  company?: string;
  jobDescription?: string;
  difficultyLevel: DifficultyLevel;
  status: InterviewStatus;
  startedAt: Date;
  endedAt?: Date;
  totalDuration?: number;
  overallScore?: number;
  feedbackSummary?: string;
  maxQuestions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionResponse {
  id: string;
  sessionId: string;
  questionNumber: number;
  question: string;
  answer: string;
  score?: number;
  feedback?: string;
  responseTime?: number;
  createdAt: Date;
}

export interface Recording {
  id: string;
  sessionId: string;
  fileUrl: string;
  duration: number;
  format: RecordingFormat;
  fileSize?: number;
  createdAt: Date;
}

export interface EvaluationReport {
  id: string;
  sessionId: string;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback?: Record<string, any>;
  interviewerComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Type aliases for common operations
// Note: After running 'npx prisma migrate dev', uncomment the Prisma imports for better types
/*
import { Prisma } from '@prisma/client';

export type CreateUserInput = Prisma.UserCreateInput;
export type UpdateUserInput = Prisma.UserUpdateInput;
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    resumes: true;
    interviewSessions: {
      include: { evaluationReport: true };
    };
  };
}>;
*/

// Manual type definitions (used before Prisma client generation)
export interface CreateUserInput {
  email: string;
  name?: string;
  password: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  password?: string;
}

export interface UserWithRelations extends User {
  resumes: Resume[];
  interviewSessions: (InterviewSession & { evaluationReport?: EvaluationReport })[];
}

export interface CreateResumeInput {
  userId: string;
  fileUrl: string;
  parsedData?: Record<string, any>;
}

export interface ResumeWithSessions extends Resume {
  interviewSessions: InterviewSession[];
}

export interface CreateInterviewSessionInput {
  userId: string;
  resumeId: string;
  role: string;
  company?: string;
  jobDescription?: string;
  difficultyLevel?: DifficultyLevel;
  maxQuestions?: number;
}

export interface InterviewSessionWithRelations extends InterviewSession {
  user?: User;
  resume?: Resume;
  questionResponses?: QuestionResponse[];
  recording?: Recording;
  evaluationReport?: EvaluationReport;
}

export interface CreateQuestionResponseInput {
  sessionId: string;
  questionNumber: number;
  question: string;
  answer: string;
  score?: number;
  feedback?: string;
  responseTime?: number;
}

export interface QuestionResponseWithSession extends QuestionResponse {
  session?: InterviewSession;
}

export interface CreateRecordingInput {
  sessionId: string;
  fileUrl: string;
  duration: number;
  format?: RecordingFormat;
  fileSize?: number;
}

export interface RecordingWithSession extends Recording {
  session?: InterviewSession;
}

export interface CreateEvaluationReportInput {
  sessionId: string;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback?: Record<string, any>;
  interviewerComments?: string;
}

export interface EvaluationReportWithSession extends EvaluationReport {
  session?: InterviewSession;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface InterviewStartResponse {
  sessionId: string;
  initialQuestion: string;
  maxQuestions: number;
  role: string;
  difficultyLevel: DifficultyLevel;
}

export interface QuestionResponsePayload {
  sessionId: string;
  questionNumber: number;
  question: string;
  answer: string;
  responseTime?: number;
}

export interface InterviewCompletePayload {
  sessionId: string;
  totalDuration: number;
  recordingUrl?: string;
  recordingFormat?: RecordingFormat;
}

export interface UserStatistics {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  bestScore: number;
  recentInterviews: InterviewSessionWithRelations[];
}

export interface InterviewStats {
  sessionId: string;
  role: string;
  difficultyLevel: DifficultyLevel;
  totalQuestions: number;
  averageScore: number;
  totalDuration: number;
  status: InterviewStatus;
  completedAt?: Date;
}

// Enums for frontend
export const InterviewStatusLabels: Record<string, string> = {
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ABANDONED: 'Abandoned',
};

export const DifficultyLabels: Record<string, string> = {
  ENTRY: 'Entry Level',
  MID: 'Mid Level',
  SENIOR: 'Senior Level',
};

export const RecordingFormatLabels: Record<string, string> = {
  WEBM: 'WebM Video',
  MP3: 'MP3 Audio',
  WAV: 'WAV Audio',
};

// Validation types
export interface ValidateInterviewSessionInput {
  userId: string;
  resumeId: string;
  role: string;
  jobDescription?: string;
  difficultyLevel?: DifficultyLevel;
}

export interface ValidateQuestionResponseInput {
  sessionId: string;
  questionNumber: number;
  question: string;
  answer: string;
  responseTime?: number;
}

// Score calculation types
export interface ScoreBreakdown {
  technical: number;
  communication: number;
  problemSolving: number;
  confidence: number;
  overall: number;
}

export interface EvaluationData {
  scores: ScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  feedback: string;
}
