/**
 * Interview Type Definitions
 * Contains all TypeScript interfaces for the AI Interviewer application
 */

export interface WorkExperience {
  company: string;
  role: string;
  duration: string;
  responsibilities: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationYear?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}

export interface ParsedResume {
  name: string;
  skills: string[];
  workExperience: WorkExperience[];
  projects: Project[];
  education: Education[];
  certifications: string[];
  yearsOfExperience: number;
  email?: string;
  phone?: string;
  location?: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  askedAt: Date;
  followUp?: boolean;
}

export interface CandidateResponse {
  questionId: string;
  response: string;
  respondedAt: Date;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface InterviewSession {
  id: string;
  resumeData: ParsedResume;
  targetRole: string;
  jobDescription?: string;
  questions: InterviewQuestion[];
  responses: CandidateResponse[];
  conversationHistory: ConversationMessage[];
  startedAt: Date;
  completedAt?: Date;
  status: 'in-progress' | 'completed' | 'paused';
}

export interface SkillAssessment {
  category: string;
  score: number;
  comments: string;
}

export interface InterviewEvaluation {
  technicalSkillsScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  roleAlignmentScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'Strong Hire' | 'Hire' | 'Maybe' | 'No Hire';
  skillAssessments: SkillAssessment[];
  feedbackSummary: string;
  areasForImprovement: string[];
  interviewerNotes: string;
}

export interface InterviewReport {
  sessionId: string;
  candidateName: string;
  targetRole: string;
  interviewDate: Date;
  durationMinutes: number;
  evaluation: InterviewEvaluation;
  transcript: ConversationMessage[];
  resumeSnapshot: ParsedResume;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ParseResumeRequest {
  file: File;
}

export interface GenerateQuestionsRequest {
  resumeData: ParsedResume;
  targetRole: string;
  jobDescription?: string;
  conversationHistory: ConversationMessage[];
  previousQuestions: InterviewQuestion[];
}

export interface EvaluateInterviewRequest {
  resumeData: ParsedResume;
  targetRole: string;
  conversationHistory: ConversationMessage[];
  interviewQuestions: InterviewQuestion[];
}

export interface GenerateReportRequest {
  evaluation: InterviewEvaluation;
  sessionData: InterviewSession;
}
