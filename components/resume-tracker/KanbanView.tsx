"use client";

/**
 * KanbanView — Drag-friendly Kanban board showing applications grouped by status.
 * Each column = one pipeline stage. Cards are clickable.
 */

import React from "react";
import { ResumeEntry, JobApplication, ApplicationStatus, STATUS_CONFIG, PIPELINE_STAGES_ORDERED } from "./types";

// All stages to show as columns
const COLUMNS: ApplicationStatus[] = [
  "SAVED", "APPLIED", "PHONE_SCREEN", "INTERVIEW", "OFFER", "REJECTED",
];

interface KanbanCard {
  app: JobApplication;
  resumeTitle: string;
  resumeId: string;
}

// ─── Single Kanban Card ────────────────────────────────────────────────────────
function KanbanCardItem({ card }: { card: KanbanCard }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-150 cursor-pointer group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 text-xs truncate group-hover:text-purple-700 transition-colors">
            {card.app.company}
          </p>
          <p className="text-xs text-gray-400 truncate">{card.app.role}</p>
        </div>
      </div>

      {/* Resume tag */}
      <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 text-xs font-medium px-2 py-0.5 rounded-full truncate max-w-full">
        <span className="w-1 h-1 rounded-full bg-purple-400 flex-shrink-0" />
        <span className="truncate">{card.resumeTitle}</span>
      </div>

      {/* Date */}
      <p className="text-xs text-gray-300 mt-2">
        {new Date(card.app.appliedDate).toLocaleDateString("en-US", {
          month: "short", day: "numeric",
        })}
      </p>
    </div>
  );
}

// ─── Kanban Column ─────────────────────────────────────────────────────────────
function KanbanColumn({ status, cards }: { status: ApplicationStatus; cards: KanbanCard[] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="flex-shrink-0 w-52 flex flex-col">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 border ${cfg.bg} ${cfg.border}`}>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
        </div>
        <span className={`text-xs font-bold ${cfg.color} bg-white/70 rounded-full w-5 h-5 flex items-center justify-center`}>
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 min-h-[120px]">
        {cards.length === 0 ? (
          <div className="border-2 border-dashed border-gray-100 rounded-xl h-20 flex items-center justify-center">
            <p className="text-xs text-gray-300">Empty</p>
          </div>
        ) : (
          cards.map((card) => <KanbanCardItem key={card.app.id} card={card} />)
        )}
      </div>
    </div>
  );
}

// ─── Main Kanban View ──────────────────────────────────────────────────────────
export default function KanbanView({ resumes }: { resumes: ResumeEntry[] }) {
  // Flatten all applications across all resumes into cards
  const allCards: KanbanCard[] = resumes.flatMap((r) =>
    r.applications.map((app) => ({
      app,
      resumeTitle: r.jobTitle,
      resumeId: r.resumeId,
    }))
  );

  const totalApps = allCards.length;

  if (totalApps === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-50 to-pink-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
          </svg>
        </div>
        <p className="text-gray-500 font-semibold mb-1">No applications yet</p>
        <p className="text-sm text-gray-400">Add job applications to your resumes to see them here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            cards={allCards.filter((c) => c.app.status === status)}
          />
        ))}
      </div>
    </div>
  );
}
