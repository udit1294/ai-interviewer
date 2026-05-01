import React from "react";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <DashboardSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="pl-10 md:pl-0">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Dashboard</p>
            <h2 className="text-gray-800 font-bold text-lg leading-tight truncate max-w-xs">
              Welcome back, {session.user.name?.split(" ")[0] || session.user.email?.split("@")[0] || "there"} 👋
            </h2>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:opacity-90 transition-opacity px-4 py-2 rounded-xl shadow-sm shadow-orange-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">New Interview</span>
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-5 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
