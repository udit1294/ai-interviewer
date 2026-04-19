import React from "react";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SessionTable from "@/components/SessionTable";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) return redirect("/login");

  // Fetch all sessions natively
  const interviewSessions = await prisma.interviewSession.findMany({
    where: { userId: session.user.id },
    include: {
      evaluationReport: true,
      resume: true
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Interviews</h1>
          <p className="text-gray-500">View and manage all your historical AI interview performance data.</p>
        </div>
      </div>
      
      <SessionTable sessions={interviewSessions as any} />
    </div>
  );
}
