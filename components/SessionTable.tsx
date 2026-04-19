"use client";

import React from "react";
import Link from "next/link";
import { Eye, ExternalLink, RefreshCw } from "lucide-react";

export default function SessionTable({ sessions }: { sessions: any[] }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center flex flex-col items-center">
        <div className="bg-blue-50 p-4 rounded-full mb-4">
          <Eye className="text-blue-500" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No interviews found</h3>
        <p className="text-gray-500 mb-6">You haven't completed any AI interviews yet.</p>
        <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Start Your First Interview
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
              <th className="py-4 px-6 text-left">Date</th>
              <th className="py-4 px-6">Role</th>
              <th className="py-4 px-6 text-center">Score</th>
              <th className="py-4 px-6 text-center">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.map((session) => {
              const reportReady = !!session.evaluationReport;
              
              const isStatusCompleted = session.status === 'COMPLETED' || reportReady;
              const msSinceCreation = Date.now() - new Date(session.createdAt).getTime();
              // If status is in progress but it's older than 5 minutes, it's an abandoned test
              const isEvaluating = !isStatusCompleted && (session.status === 'IN_PROGRESS' || session.status === 'EVALUATING') && msSinceCreation < 5 * 60 * 1000;

              const dateRaw = new Date(session.createdAt);
              const formattedDate = dateRaw.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              
              return (
                <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-800">
                    {formattedDate}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-800">{session.role}</div>
                    <div className="text-xs text-gray-500">{session.difficultyLevel || 'Standard'} Mode</div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {reportReady ? (
                       <span className="inline-flex items-center justify-center font-bold text-blue-700 bg-blue-100 h-8 px-3 rounded-full text-sm">
                         {session.evaluationReport.overallScore}/10
                       </span>
                    ) : (
                       <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {isStatusCompleted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    ) : isEvaluating ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 gap-1 shadow-sm border border-blue-200">
                        <RefreshCw size={12} className="animate-spin" /> Evaluating
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Incomplete
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {reportReady ? (
                          <a href={`/dashboard/session/${session.id}`} className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition" title="View Full Report">
                             <ExternalLink size={18} />
                          </a>
                       ) : isEvaluating ? (
                          <div className="text-gray-400 bg-gray-50 p-2 rounded-lg cursor-wait transition" title="Generating Report...">
                             <RefreshCw size={18} className="animate-spin text-gray-400" />
                          </div>
                       ) : (
                          <Link href="/" className="text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition" title="Retake Interview">
                             <RefreshCw size={18} />
                          </Link>
                       )}
                    </div>
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
