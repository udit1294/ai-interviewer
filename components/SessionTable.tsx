"use client";

/**
 * SessionTable — Interview history table with skeleton loading, empty state,
 * status badges, score chips, and action buttons.
 * Dynamically reacts to session status changes.
 */

import React from "react";
import Link from "next/link";
import { ExternalLink, RefreshCw, Loader2 } from "lucide-react";

// ─── Skeleton Row (loading state) ─────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-4 px-5"><div className="h-3.5 bg-gray-100 rounded-full w-20" /></td>
      <td className="py-4 px-5">
        <div className="h-3.5 bg-gray-100 rounded-full w-32 mb-1.5" />
        <div className="h-2.5 bg-gray-100 rounded-full w-20" />
      </td>
      <td className="py-4 px-5 text-center"><div className="h-6 bg-gray-100 rounded-full w-14 mx-auto" /></td>
      <td className="py-4 px-5 text-center"><div className="h-5 bg-gray-100 rounded-full w-20 mx-auto" /></td>
      <td className="py-4 px-5 text-right"><div className="h-8 bg-gray-100 rounded-lg w-8 ml-auto" /></td>
    </tr>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: "completed" | "evaluating" | "incomplete" }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Completed
      </span>
    );
  }
  if (status === "evaluating") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
        <Loader2 size={11} className="animate-spin" />
        Evaluating
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      Incomplete
    </span>
  );
}

// ─── Score Chip ────────────────────────────────────────────────────────────────
function ScoreChip({ score }: { score: number }) {
  const color =
    score >= 8 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    score >= 6 ? "bg-orange-50 text-orange-700 border-orange-200" :
                 "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={`inline-flex items-center justify-center font-bold text-sm px-3 py-1 rounded-full border ${color}`}>
      {score}/10
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SessionTable({
  sessions,
  loading = false,
}: {
  sessions: any[];
  loading?: boolean;
}) {

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!loading && (!sessions || sessions.length === 0)) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center flex flex-col items-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-50 to-pink-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">No interviews yet</h3>
        <p className="text-sm text-gray-400 mb-6 max-w-xs">
          You haven't completed any AI interviews yet. Upload your resume to get started.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start Your First Interview
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left" role="table" aria-label="Interview sessions">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              <th className="py-3.5 px-5 font-medium">Date</th>
              <th className="py-3.5 px-5 font-medium">Role</th>
              <th className="py-3.5 px-5 text-center font-medium">Score</th>
              <th className="py-3.5 px-5 text-center font-medium">Status</th>
              <th className="py-3.5 px-5 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">

            {/* Skeleton rows while loading */}
            {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}

            {/* Data rows */}
            {!loading && sessions.map((session) => {
              const reportReady     = !!session.evaluationReport;
              const isCompleted     = session.status === "COMPLETED" || reportReady;
              const msSince         = Date.now() - new Date(session.createdAt).getTime();
              const isEvaluating    = !isCompleted &&
                (session.status === "IN_PROGRESS" || session.status === "EVALUATING") &&
                msSince < 5 * 60 * 1000;

              const badgeStatus: "completed" | "evaluating" | "incomplete" =
                isCompleted ? "completed" : isEvaluating ? "evaluating" : "incomplete";

              const date = new Date(session.createdAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              });

              return (
                <tr
                  key={session.id}
                  className="hover:bg-gray-50/80 transition-colors duration-100 group"
                >
                  {/* Date */}
                  <td className="py-4 px-5 text-sm text-gray-500 whitespace-nowrap">{date}</td>

                  {/* Role */}
                  <td className="py-4 px-5">
                    <p className="font-semibold text-gray-800 text-sm group-hover:text-purple-700 transition-colors truncate max-w-[160px]">
                      {session.role}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {session.difficultyLevel || "Standard"} mode
                    </p>
                  </td>

                  {/* Score */}
                  <td className="py-4 px-5 text-center">
                    {reportReady
                      ? <ScoreChip score={session.evaluationReport.overallScore} />
                      : <span className="text-gray-300 text-sm font-medium">—</span>
                    }
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5 text-center">
                    <StatusBadge status={badgeStatus} />
                  </td>

                  {/* Action */}
                  <td className="py-4 px-5 text-right">
                    {reportReady ? (
                      <a
                        href={`/dashboard/session/${session.id}`}
                        title="View full report"
                        aria-label={`View report for ${session.role}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition"
                      >
                        <ExternalLink size={13} />
                        Report
                      </a>
                    ) : isEvaluating ? (
                      <span
                        title="Generating report..."
                        className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg cursor-wait"
                      >
                        <RefreshCw size={13} className="animate-spin" />
                        Processing
                      </span>
                    ) : (
                      <Link
                        href="/"
                        title="Retake this interview"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition"
                      >
                        <RefreshCw size={13} />
                        Retake
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
