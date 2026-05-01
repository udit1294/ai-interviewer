"use client";

/**
 * ApplicationDrawer — Slide-in panel showing full job application pipeline.
 * Fixed: Download button, editable notes, working Add Application modal.
 */

import React, { useState } from "react";
import { X, ExternalLink, MapPin, DollarSign, Calendar, Plus } from "lucide-react";
import { ResumeEntry, JobApplication, STATUS_CONFIG, ApplicationStatus } from "./types";
import StatusBadge from "./StatusBadge";
import NotesEditor from "./NotesEditor";
import DownloadButton from "./DownloadButton";
import ApplicationModal from "./ApplicationModal";

// ─── Pipeline bar (top 5 active stages) ───────────────────────────────────────
const PIPELINE_STAGES: ApplicationStatus[] = [
  "SAVED", "APPLIED", "PHONE_SCREEN", "INTERVIEW", "OFFER",
];

function PipelineBar({ applications }: { applications: JobApplication[] }) {
  const counts = PIPELINE_STAGES.reduce((acc, s) => {
    acc[s] = applications.filter((a) => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex items-stretch rounded-xl overflow-hidden border border-gray-100">
      {PIPELINE_STAGES.map((stage) => {
        const cfg   = STATUS_CONFIG[stage];
        const count = counts[stage] || 0;
        return (
          <div
            key={stage}
            className={`flex-1 ${cfg.bg} flex flex-col items-center justify-center py-3 px-1 border-r border-white last:border-r-0`}
          >
            <span className={`text-base font-bold ${cfg.color}`}>{count}</span>
            <span className="text-xs text-gray-400 text-center leading-tight mt-0.5 truncate w-full text-center px-1">
              {cfg.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Application Card (with NotesEditor wired in) ─────────────────────────────
function AppCard({
  app,
  onStatusChange,
  onNotesChange,
}: {
  app: JobApplication;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onNotesChange:  (id: string, notes: string) => void;
}) {
  const date = new Date(app.appliedDate).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-purple-200 hover:shadow-sm transition-all duration-150">

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-bold text-gray-800 text-sm">{app.company}</p>
          <p className="text-xs text-gray-500 truncate">{app.role}</p>
        </div>
        {/* ✅ FIX: Status badge with editable dropdown */}
        <StatusBadge
          status={app.status}
          editable
          onChange={(s) => onStatusChange(app.id, s)}
        />
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-2">
        <span className="flex items-center gap-1">
          <Calendar size={11} /> {date}
        </span>
        {app.location && (
          <span className="flex items-center gap-1">
            <MapPin size={11} /> {app.location}
          </span>
        )}
        {app.salary && (
          <span className="flex items-center gap-1">
            <DollarSign size={11} /> {app.salary}
          </span>
        )}
        {app.url && (
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors"
          >
            <ExternalLink size={11} /> View Job
          </a>
        )}
      </div>

      {/* ✅ FIX: Notes are now editable and persist per application */}
      <NotesEditor
        notes={app.notes}
        onSave={(notes) => onNotesChange(app.id, notes)}
      />
    </div>
  );
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────
interface DrawerProps {
  resume: ResumeEntry | null;
  onClose: () => void;
  onStatusChange: (resumeId: string, appId: string, status: ApplicationStatus) => void;
  onNotesChange:  (resumeId: string, appId: string, notes: string) => void;
  onAddApplication: (resumeId: string, app: JobApplication) => void;
}

export default function ApplicationDrawer({
  resume,
  onClose,
  onStatusChange,
  onNotesChange,
  onAddApplication,
}: DrawerProps) {
  const [showModal, setShowModal] = useState(false);

  if (!resume) return null;

  const totalApps  = resume.applications.length;
  const activeApps = resume.applications.filter(
    (a) => !["REJECTED", "WITHDRAWN"].includes(a.status)
  ).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#f8fafc] z-50 shadow-2xl flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between gap-4 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-0.5">Resume</p>
            <h2 className="text-base font-bold text-gray-900 truncate">{resume.jobTitle}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs text-gray-400">{totalApps} applications</span>
              <span className="text-xs text-emerald-600 font-medium">{activeApps} active</span>
              {resume.score != null && (
                <span className="text-xs font-bold text-purple-600">Score: {resume.score}/10</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* ✅ FIX: Download button is now functional */}
            <DownloadButton fileUrl={resume.fileUrl} fileName={`${resume.jobTitle.replace(/\s+/g, "_")}_resume.pdf`} />
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Pipeline bar */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Pipeline</p>
            <PipelineBar applications={resume.applications} />
          </div>

          {/* Applications list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Applications ({totalApps})
              </p>
              {/* ✅ FIX: Add button now opens modal */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
              >
                <Plus size={13} /> Add
              </button>
            </div>

            {/* Empty state */}
            {totalApps === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
                  <Plus size={22} className="text-purple-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">No applications yet</p>
                <p className="text-xs text-gray-400 mb-4">Track your first job application for this resume.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                >
                  + Add first application
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {resume.applications.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onStatusChange={(appId, status) => onStatusChange(resume.resumeId, appId, status)}
                    onNotesChange={(appId, notes)   => onNotesChange(resume.resumeId, appId, notes)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          {/* ✅ FIX: Both "Add Application" buttons now open the modal */}
          <button
            onClick={() => setShowModal(true)}
            className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1.5"
          >
            <Plus size={15} /> Add Application
          </button>
          <button
            onClick={onClose}
            className="text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* ✅ FIX: ApplicationModal renders on top of drawer */}
      {showModal && (
        <ApplicationModal
          onAdd={(app) => {
            onAddApplication(resume.resumeId, app);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
