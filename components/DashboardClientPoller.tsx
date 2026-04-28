"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import SessionTable from "@/components/SessionTable";

export default function DashboardClientPoller({ initialSessions }: { initialSessions: any[] }) {
  const router = useRouter();

  useEffect(() => {
    // Check if any recent session is missing its report
    const hasEvaluatingSession = initialSessions.some(
       (s) => !s.evaluationReport && (Date.now() - new Date(s.createdAt).getTime()) < 300000 
    );

    if (hasEvaluatingSession) {
      // Poll every 4 seconds dynamically by asking Next to re-run the server-side data fetch
      const interval = setInterval(() => {
        router.refresh(); 
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [initialSessions, router]);

  return <SessionTable sessions={initialSessions} />;
}
