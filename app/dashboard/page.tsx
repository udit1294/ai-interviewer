import React from "react";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClientPoller from "@/components/DashboardClientPoller";
import Link from "next/link";

// ─── Reusable StatCard ──────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon,
  gradient,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow duration-200">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${gradient}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── CTA Card ──────────────────────────────────────────────────────────────────
function CTACard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-6 text-white shadow-lg">
      {/* decorative blob */}
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">Ready to practice?</p>
          <h3 className="text-xl font-bold mb-1">Start a New Interview</h3>
          <p className="text-sm text-white/80">Upload your resume and get AI-generated questions tailored to your role.</p>
        </div>
        <Link
          href="/"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-purple-700 font-bold text-sm px-5 py-3 rounded-xl hover:bg-purple-50 transition-colors shadow-md"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start Now
        </Link>
      </div>
    </div>
  );
}

// ─── Score Bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(Math.max(score * 10, 0), 100);
  const color =
    score >= 8 ? "from-green-400 to-emerald-500" :
    score >= 6 ? "from-orange-400 to-yellow-400" :
                 "from-red-400 to-pink-500";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8 text-right">{score}/10</span>
    </div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) return redirect("/login");

  const interviewSessions = await prisma.interviewSession.findMany({
    where: { userId: session.user.id },
    include: { evaluationReport: true, resume: true },
    orderBy: { createdAt: "desc" },
  });

  // ── Compute stats ──────────────────────────────────────────────────────────
  const total        = interviewSessions.length;
  const completed    = interviewSessions.filter((s) => s.status === "COMPLETED").length;
  const withScores   = interviewSessions.filter((s) => s.evaluationReport?.overallScore);
  const avgScore     = withScores.length
    ? (withScores.reduce((acc, s) => acc + (s.evaluationReport?.overallScore ?? 0), 0) / withScores.length).toFixed(1)
    : "—";
  const bestScore    = withScores.length
    ? Math.max(...withScores.map((s) => s.evaluationReport?.overallScore ?? 0))
    : null;

  // Recent 3 completed sessions for activity feed
  const recentCompleted = interviewSessions
    .filter((s) => s.status === "COMPLETED" && s.evaluationReport)
    .slice(0, 3);

  return (
    <div className="w-full space-y-7">

      {/* ── CTA ── */}
      <CTACard />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Interviews"
          value={total}
          sub={total === 1 ? "1 session" : `${total} sessions`}
          gradient="bg-gradient-to-br from-blue-50 to-blue-100"
          icon={
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Completed"
          value={completed}
          sub={total ? `${Math.round((completed / total) * 100)}% completion` : "—"}
          gradient="bg-gradient-to-br from-green-50 to-emerald-100"
          icon={
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Avg Score"
          value={avgScore === "—" ? "—" : `${avgScore}/10`}
          sub={withScores.length ? `From ${withScores.length} evaluated` : "No scores yet"}
          gradient="bg-gradient-to-br from-orange-50 to-amber-100"
          icon={
            <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />
        <StatCard
          label="Best Score"
          value={bestScore !== null ? `${bestScore}/10` : "—"}
          sub={bestScore !== null ? (bestScore >= 8 ? "🔥 Excellent" : bestScore >= 6 ? "Good" : "Keep going") : "Complete an interview"}
          gradient="bg-gradient-to-br from-purple-50 to-pink-100"
          icon={
            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>

      {/* ── Main grid: Interview Table + Activity Feed ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Interview Table (takes 2/3 width on xl) */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">My Interviews</h2>
            <p className="text-sm text-gray-400">{total} total</p>
          </div>
          <DashboardClientPoller initialSessions={interviewSessions as any} />
        </div>

        {/* Activity Feed (takes 1/3 width on xl) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          </div>

          {recentCompleted.length === 0 ? (
            /* ── Empty state ── */
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-700 mb-1">No activity yet</p>
              <p className="text-sm text-gray-400 mb-4">Complete an interview to see your performance here.</p>
              <Link href="/" className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                Start your first →
              </Link>
            </div>
          ) : (
            /* ── Activity cards ── */
            <div className="space-y-3">
              {recentCompleted.map((s) => {
                const score = s.evaluationReport?.overallScore ?? 0;
                const date = new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                return (
                  <a
                    key={s.id}
                    href={`/dashboard/session/${s.id}`}
                    className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-purple-200 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 text-sm truncate group-hover:text-purple-700 transition-colors">{s.role}</p>
                        <p className="text-xs text-gray-400">{date} · {s.difficultyLevel || "Standard"}</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-0.5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <ScoreBar score={score} />
                  </a>
                );
              })}

              {/* Chart placeholder — ready for Recharts */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-3">Score Trend</p>
                <div className="h-20 flex items-end gap-1.5">
                  {interviewSessions
                    .filter((s) => s.evaluationReport?.overallScore)
                    .slice(-7)
                    .reverse()
                    .map((s, i) => {
                      const score = s.evaluationReport?.overallScore ?? 0;
                      const h = Math.max(score * 10, 8);
                      const color = score >= 8 ? "bg-emerald-400" : score >= 6 ? "bg-orange-400" : "bg-red-400";
                      return (
                        <div key={i} title={`${score}/10`} className="flex-1 flex flex-col justify-end">
                          <div className={`${color} rounded-t-md transition-all duration-300`} style={{ height: `${h}%` }} />
                        </div>
                      );
                    })}
                  {interviewSessions.filter((s) => s.evaluationReport?.overallScore).length === 0 && (
                    <div className="w-full flex items-center justify-center text-xs text-gray-300">No data yet</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
