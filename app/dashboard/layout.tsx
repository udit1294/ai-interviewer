import React from "react";
import Link from "next/link";
import { LayoutDashboard, FileText, BarChart2, LogOut, Home } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col pt-8 pb-4 px-4 hidden md:flex">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <LayoutDashboard size={24} />
          </div>
          <span className="text-xl font-bold text-gray-800">Interviewer</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-700 font-medium transition-colors">
            <FileText size={20} />
            My Interviews
          </Link>
          <Link href="/dashboard/analytics" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-700 font-medium transition-colors">
            <BarChart2 size={20} />
            Analytics
          </Link>
          <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-700 font-medium transition-colors mt-8 border-t border-gray-100">
            <Home size={20} />
            Start New Interview
          </Link>
        </nav>
        
        <div className="border-t border-gray-200 pt-4 px-2 mt-auto text-sm text-gray-500">
          <div className="font-semibold text-gray-800 break-all">{session.user.email}</div>
          <p className="mt-1">Logged in</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto w-full">
           {children}
        </div>
      </main>
    </div>
  );
}
