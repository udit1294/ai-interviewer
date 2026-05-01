"use client";

/**
 * ResumeTable — Sortable, filterable, paginated resume table.
 * Clicking a row opens the ApplicationDrawer.
 */

import React, { useState, useMemo } from "react";
import {
  ChevronUp, ChevronDown, ChevronsUpDown, Search, Filter,
  ExternalLink, ChevronLeft, ChevronRight, FileText, Sparkles,
} from "lucide-react";
import { ResumeEntry, ApplicationStatus, STATUS_CONFIG, ALL_STATUSES } from "./types";
import StatusBadge from "./StatusBadge";

type SortKey = "jobTitle" | "score" | "createdAt" | "applications";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 8;

// ─── Score mini-bar ────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-300 text-sm">—</span>;
  const pct = score * 10;
  const color =
    score >= 8 ? "from-emerald-400 to-green-500" :
    score >= 6 ? "from-orange-400 to-amber-400" :
                 "from-red-400 to-pink-500";
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8">{score}/10</span>
    </div>
  );
}

// ─── Sortable column header ────────────────────────────────────────────────────
function SortHeader({
  label, sortKey, current, dir, onSort,
}: {
  label: string; sortKey: SortKey;
  current: SortKey; dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <th
      className="py-3.5 px-4 font-semibold text-xs text-gray-400 uppercase tracking-widest cursor-pointer select-none hover:text-gray-700 transition-colors whitespace-nowrap"
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active
          ? dir === "asc" ? <ChevronUp size={13} className="text-purple-500" /> : <ChevronDown size={13} className="text-purple-500" />
          : <ChevronsUpDown size={13} className="opacity-30" />
        }
      </span>
    </th>
  );
}

// ─── Main Table ────────────────────────────────────────────────────────────────
export default function ResumeTable({
  resumes,
  onRowClick,
}: {
  resumes: ResumeEntry[];
  onRowClick: (r: ResumeEntry) => void;
}) {
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const [sortKey, setSortKey]     = useState<SortKey>("createdAt");
  const [sortDir, setSortDir]     = useState<SortDir>("desc");
  const [page, setPage]           = useState(1);

  // ── Sort handler ─────────────────────────────────────────────────────────────
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  // ── Filter + sort pipeline ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return resumes
      .filter((r) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          r.jobTitle.toLowerCase().includes(q) ||
          r.applications.some(
            (a) => a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)
          );
        const matchStatus =
          filterStatus === "ALL" ||
          r.applications.some((a) => a.status === filterStatus);
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        let av: any, bv: any;
        if (sortKey === "score")        { av = a.score ?? -1; bv = b.score ?? -1; }
        else if (sortKey === "jobTitle"){ av = a.jobTitle.toLowerCase(); bv = b.jobTitle.toLowerCase(); }
        else if (sortKey === "applications") { av = a.applications.length; bv = b.applications.length; }
        else { av = new Date(a.createdAt).getTime(); bv = new Date(b.createdAt).getTime(); }
        return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      });
  }, [resumes, search, filterStatus, sortKey, sortDir]);

  // ── Pagination ───────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by role, company…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={filterStatus}
            onChange={(e) => { setFilter(e.target.value as any); setPage(1); }}
            className="pl-8 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition appearance-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <SortHeader label="Role / Resume"   sortKey="jobTitle"      current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHeader label="AI Score"        sortKey="score"         current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHeader label="Applications"    sortKey="applications"  current={sortKey} dir={sortDir} onSort={handleSort} />
                <th className="py-3.5 px-4 font-semibold text-xs text-gray-400 uppercase tracking-widest">Pipeline</th>
                <SortHeader label="Created"         sortKey="createdAt"     current={sortKey} dir={sortDir} onSort={handleSort} />
                <th className="py-3.5 px-4 font-semibold text-xs text-gray-400 uppercase tracking-widest text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">

              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-1">
                        <Search size={22} className="text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-semibold">No results found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((resume) => {
                  const apps       = resume.applications;
                  const activeApps = apps.filter((a) => !["REJECTED","WITHDRAWN"].includes(a.status));

                  // Show top 3 unique statuses as mini badges in pipeline column
                  const topStatuses = [...new Set(apps.map((a) => a.status))].slice(0, 3);

                  return (
                    <tr
                      key={resume.resumeId}
                      onClick={() => onRowClick(resume)}
                      className="hover:bg-purple-50/40 cursor-pointer transition-colors duration-100 group"
                    >
                      {/* Role */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                            ${resume.source === "AI_GENERATED"
                              ? "bg-gradient-to-br from-purple-100 to-pink-100"
                              : "bg-gradient-to-br from-blue-50 to-indigo-100"}`}
                          >
                            {resume.source === "AI_GENERATED"
                              ? <Sparkles size={14} className="text-purple-500" />
                              : <FileText size={14} className="text-blue-500" />
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate max-w-[180px] group-hover:text-purple-700 transition-colors">
                              {resume.jobTitle}
                            </p>
                            <p className="text-xs text-gray-400">{resume.source === "AI_GENERATED" ? "AI Generated" : "Uploaded"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-4 px-4"><ScoreBar score={resume.score} /></td>

                      {/* Application count */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">{apps.length}</span>
                          <span className="text-xs text-gray-400">{activeApps.length} active</span>
                        </div>
                      </td>

                      {/* Pipeline preview */}
                      <td className="py-4 px-4">
                        {topStatuses.length === 0 ? (
                          <span className="text-xs text-gray-300">No applications</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {topStatuses.map((s) => (
                              <StatusBadge key={s} status={s} editable={false} />
                            ))}
                            {apps.length > 3 && (
                              <span className="text-xs text-gray-400 self-center">+{apps.length - 3}</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Created date */}
                      <td className="py-4 px-4 text-sm text-gray-400 whitespace-nowrap">
                        {new Date(resume.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 group-hover:text-purple-800 bg-purple-50 group-hover:bg-purple-100 px-3 py-1.5 rounded-lg transition">
                          <ExternalLink size={12} /> View
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination footer ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition
                    ${n === page
                      ? "bg-purple-600 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                    }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
