/**
 * Shared data model for the Resume + Job Tracking system
 * Replace dummy data with API calls in production
 */

export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "PHONE_SCREEN"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

export const PIPELINE_STAGES_ORDERED: ApplicationStatus[] = [
  "SAVED", "APPLIED", "PHONE_SCREEN", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN",
];

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: string; // ISO string
  updatedAt: string;
  notes?: string;
  salary?: string;
  location?: string;
  url?: string;
}

export interface ResumeEntry {
  resumeId: string;
  jobTitle: string;         // Target role this resume was built for
  score: number | null;     // AI evaluation score (0-10)
  createdAt: string;
  updatedAt: string;
  source: "UPLOAD" | "AI_GENERATED";
  fileUrl?: string;
  applications: JobApplication[];
}

// ─── Status metadata ───────────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  SAVED:        { label: "Saved",        color: "text-slate-600",  bg: "bg-slate-50",   border: "border-slate-200",  dot: "bg-slate-400"  },
  APPLIED:      { label: "Applied",      color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",   dot: "bg-blue-500"   },
  PHONE_SCREEN: { label: "Phone Screen", color: "text-indigo-700", bg: "bg-indigo-50",  border: "border-indigo-200", dot: "bg-indigo-500" },
  INTERVIEW:    { label: "Interview",    color: "text-violet-700", bg: "bg-violet-50",  border: "border-violet-200", dot: "bg-violet-500" },
  OFFER:        { label: "Offer 🎉",     color: "text-emerald-700",bg: "bg-emerald-50", border: "border-emerald-200",dot: "bg-emerald-500"},
  REJECTED:     { label: "Rejected",     color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200",    dot: "bg-red-400"    },
  WITHDRAWN:    { label: "Withdrawn",    color: "text-gray-500",   bg: "bg-gray-50",    border: "border-gray-200",   dot: "bg-gray-400"   },
};

export const ALL_STATUSES = Object.keys(STATUS_CONFIG) as ApplicationStatus[];

// ─── Dummy data for demo / local testing ──────────────────────────────────────
export const DUMMY_RESUMES: ResumeEntry[] = [
  {
    resumeId: "r1",
    jobTitle: "Senior Frontend Engineer",
    score: 8.5,
    createdAt: "2026-04-10T10:00:00Z",
    updatedAt: "2026-04-28T14:00:00Z",
    source: "UPLOAD",
    applications: [
      { id: "a1", company: "Stripe",   role: "Senior Frontend Engineer", status: "INTERVIEW",    appliedDate: "2026-04-12T00:00:00Z", updatedAt: "2026-04-20T00:00:00Z", salary: "$180k", location: "Remote",      notes: "Great culture fit. Scheduled for system design round." },
      { id: "a2", company: "Vercel",   role: "Frontend Engineer",        status: "OFFER",        appliedDate: "2026-04-13T00:00:00Z", updatedAt: "2026-04-25T00:00:00Z", salary: "$200k", location: "San Francisco", notes: "Offer received! Negotiating equity." },
      { id: "a3", company: "Linear",   role: "Software Engineer",        status: "PHONE_SCREEN", appliedDate: "2026-04-15T00:00:00Z", updatedAt: "2026-04-22T00:00:00Z", location: "Remote",      notes: "Initial screen went well." },
    ],
  },
  {
    resumeId: "r2",
    jobTitle: "Full Stack Developer",
    score: 7.2,
    createdAt: "2026-04-15T10:00:00Z",
    updatedAt: "2026-04-27T14:00:00Z",
    source: "UPLOAD",
    applications: [
      { id: "a4", company: "Shopify",  role: "Full Stack Developer",     status: "APPLIED",   appliedDate: "2026-04-16T00:00:00Z", updatedAt: "2026-04-16T00:00:00Z", location: "Remote",    notes: "Applied via website." },
      { id: "a5", company: "Notion",   role: "Software Engineer II",     status: "REJECTED",  appliedDate: "2026-04-17T00:00:00Z", updatedAt: "2026-04-26T00:00:00Z", notes: "Not a fit for current role." },
    ],
  },
  {
    resumeId: "r3",
    jobTitle: "AI/ML Engineer",
    score: 9.1,
    createdAt: "2026-04-20T10:00:00Z",
    updatedAt: "2026-04-29T14:00:00Z",
    source: "AI_GENERATED",
    applications: [
      { id: "a6", company: "OpenAI",   role: "ML Engineer",              status: "INTERVIEW", appliedDate: "2026-04-21T00:00:00Z", updatedAt: "2026-04-28T00:00:00Z", salary: "$250k+", location: "San Francisco", notes: "Passed coding screen. Final round next week." },
      { id: "a7", company: "Anthropic",role: "Research Engineer",        status: "SAVED",     appliedDate: "2026-04-22T00:00:00Z", updatedAt: "2026-04-22T00:00:00Z", notes: "Draft application, need referral." },
    ],
  },
  {
    resumeId: "r4",
    jobTitle: "Product Engineer",
    score: null,
    createdAt: "2026-04-28T10:00:00Z",
    updatedAt: "2026-04-28T10:00:00Z",
    source: "UPLOAD",
    applications: [],
  },
];
