import React from "react";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AnalyticsCharts from "@/components/AnalyticsCharts";

export default async function AnalyticsPage() {
  const sessionAuth = await getAuthSession();
  if (!sessionAuth?.user?.id) return redirect("/login");

  // Fetch all completed session Reports for trends
  const completedSessions = await prisma.interviewSession.findMany({
    where: { userId: sessionAuth.user.id, evaluationReport: { isNot: null } },
    include: { evaluationReport: true },
    orderBy: { createdAt: "asc" }, // Ascending for chronological trending
  });

  if (completedSessions.length === 0) {
    return (
      <div className="w-full flex justify-center py-24 text-gray-500">
        You need to complete at least one interview to view analytics.
      </div>
    );
  }

  // Map Line Chart Data
  const trendData = completedSessions.map((session) => {
    const r = session.evaluationReport!;
    return {
      date: new Date(session.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      overall: r.overallScore,
      technical: r.technicalScore,
      communication: r.communicationScore,
      role: session.role
    };
  });

  // Map Radar Chart Averages
  let avgTech = 0, avgComm = 0, avgProb = 0, avgConf = 0;
  completedSessions.forEach((session) => {
    avgTech += session.evaluationReport!.technicalScore;
    avgComm += session.evaluationReport!.communicationScore;
    avgProb += session.evaluationReport!.problemSolvingScore;
    avgConf += session.evaluationReport!.confidenceScore;
  });
  const count = completedSessions.length;

  const radarData = [
    { subject: 'Technical', A: Math.round((avgTech / count) * 10) / 10, fullMark: 10 },
    { subject: 'Communication', A: Math.round((avgComm / count) * 10) / 10, fullMark: 10 },
    { subject: 'Problem Solving', A: Math.round((avgProb / count) * 10) / 10, fullMark: 10 },
    { subject: 'Confidence', A: Math.round((avgConf / count) * 10) / 10, fullMark: 10 },
  ];

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Analytics</h1>
        <p className="text-gray-500">Track and synthesize your AI interview scores across different roles.</p>
      </div>
      
      <AnalyticsCharts trendData={trendData} radarData={radarData} />
    </div>
  );
}
