"use client";

/**
 * /dashboard/resumes — Resume + Job Tracking page
 * Combines ResumeTable (list view) + KanbanView (pipeline view) + ApplicationDrawer
 */

import React, { useState } from "react";
import { LayoutGrid, List, Plus, Briefcase, FileText, TrendingUp, Target } from "lucide-react";
import { ResumeEntry, ApplicationStatus, JobApplication, DUMMY_RESUMES } from "@/components/resume-tracker/types";
import ResumeTable from "@/components/resume-tracker/ResumeTable";
import KanbanView from "@/components/resume-tracker/KanbanView";
import ApplicationDrawer from "@/components/resume-tracker/ApplicationDrawer";
import ResumeUploadModal from "@/components/resume-tracker/ResumeUploadModal";

type ViewMode = "table" | "kanban";

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, gradient }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; gradient: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${gradient}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ResumesPage() {
  // In production: replace DUMMY_RESUMES with a fetch/SWR/React Query call
  const [resumes, setResumes]       = useState<ResumeEntry[]>(DUMMY_RESUMES);
  const [view, setView]             = useState<ViewMode>("table");
  const [selected, setSelected]     = useState<ResumeEntry | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // ── Resume uploaded from modal → add to table (no interview redirect) ────────
  const handleResumeUploaded = (resumeId: string, jobTitle: string) => {
    const newEntry: ResumeEntry = {
      resumeId,
      jobTitle,
      score: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: "UPLOAD",
      applications: [],
    };
    setResumes((prev) => [newEntry, ...prev]);
    setShowUploadModal(false);
  };

  // ── Inline status change handler ────────────────────────────────────────────
  const handleStatusChange = (resumeId: string, appId: string, newStatus: ApplicationStatus) => {
    setResumes((prev) =>
      prev.map((r) =>
        r.resumeId !== resumeId ? r : {
          ...r,
          applications: r.applications.map((a) =>
            a.id !== appId ? a : { ...a, status: newStatus, updatedAt: new Date().toISOString() }
          ),
        }
      )
    );
    setSelected((prev) =>
      !prev || prev.resumeId !== resumeId ? prev : {
        ...prev,
        applications: prev.applications.map((a) =>
          a.id !== appId ? a : { ...a, status: newStatus, updatedAt: new Date().toISOString() }
        ),
      }
    );
  };

  // ✅ FIX: Notes change handler — persists per application
  const handleNotesChange = (resumeId: string, appId: string, notes: string) => {
    setResumes((prev) =>
      prev.map((r) =>
        r.resumeId !== resumeId ? r : {
          ...r,
          applications: r.applications.map((a) =>
            a.id !== appId ? a : { ...a, notes, updatedAt: new Date().toISOString() }
          ),
        }
      )
    );
    setSelected((prev) =>
      !prev || prev.resumeId !== resumeId ? prev : {
        ...prev,
        applications: prev.applications.map((a) =>
          a.id !== appId ? a : { ...a, notes, updatedAt: new Date().toISOString() }
        ),
      }
    );
  };

  // ✅ FIX: Add application handler — appends new app immutably
  const handleAddApplication = (resumeId: string, app: JobApplication) => {
    setResumes((prev) =>
      prev.map((r) =>
        r.resumeId !== resumeId ? r : {
          ...r,
          applications: [...r.applications, app],
          updatedAt: new Date().toISOString(),
        }
      )
    );
    setSelected((prev) =>
      !prev || prev.resumeId !== resumeId ? prev : {
        ...prev,
        applications: [...prev.applications, app],
      }
    );
  };

  // ── Computed stats ─────────────────────────────────────────────────────────────
  const allApps   = resumes.flatMap((r) => r.applications);
  const totalApps = allApps.length;
  const offers    = allApps.filter((a) => a.status === "OFFER").length;
  const interviews= allApps.filter((a) => a.status === "INTERVIEW").length;
  const avgScore  = resumes.filter((r) => r.score !== null).length
    ? (resumes.filter((r) => r.score !== null)
        .reduce((s, r) => s + (r.score ?? 0), 0) /
       resumes.filter((r) => r.score !== null).length
      ).toFixed(1)
    : "—";

  return (
    <div className="w-full space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume Tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage your resumes and track every job application in one place.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:opacity-90 px-4 py-2.5 rounded-xl shadow-sm transition-opacity flex-shrink-0"
        >
          <Plus size={16} /> New Resume
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Resumes"
          value={resumes.length}
          sub="Total uploaded"
          gradient="bg-gradient-to-br from-blue-50 to-indigo-100"
          icon={<FileText size={18} className="text-blue-500" />}
        />
        <StatCard
          label="Applications"
          value={totalApps}
          sub="Across all resumes"
          gradient="bg-gradient-to-br from-orange-50 to-amber-100"
          icon={<Briefcase size={18} className="text-orange-500" />}
        />
        <StatCard
          label="Interviews"
          value={interviews}
          sub="Active interview stage"
          gradient="bg-gradient-to-br from-violet-50 to-purple-100"
          icon={<Target size={18} className="text-violet-500" />}
        />
        <StatCard
          label="Offers"
          value={offers}
          sub={offers > 0 ? "🎉 Congratulations!" : "Keep applying!"}
          gradient="bg-gradient-to-br from-emerald-50 to-green-100"
          icon={<TrendingUp size={18} className="text-emerald-500" />}
        />
      </div>

      {/* ── View toggle + table/kanban ── */}
      <div>
        {/* Toggle buttons */}
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-white border border-gray-200 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${view === "table"
                  ? "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              <List size={13} /> Table
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${view === "kanban"
                  ? "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              <LayoutGrid size={13} /> Kanban
            </button>
          </div>
          <p className="text-xs text-gray-400">{resumes.length} resumes · {totalApps} applications</p>
        </div>

        {/* Views */}
        {view === "table" ? (
          <ResumeTable resumes={resumes} onRowClick={setSelected} />
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <KanbanView resumes={resumes} />
          </div>
        )}
      </div>

      {/* ── Application Drawer ── */}
      {selected && (
        <ApplicationDrawer
          resume={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onNotesChange={handleNotesChange}
          onAddApplication={handleAddApplication}
        />
      )}

      {/* ✅ Upload modal — saves resume to tracker only, no interview start */}
      {showUploadModal && (
        <ResumeUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleResumeUploaded}
        />
      )}
    </div>
  );
}
