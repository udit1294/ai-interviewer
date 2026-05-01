"use client";

/**
 * DashboardSidebar — Collapsible sidebar with active state logic
 * Used inside DashboardLayout (client component for interactivity)
 */

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Home,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Briefcase,
} from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",          icon: <LayoutDashboard size={18} />, label: "Overview"        },
  { href: "/dashboard/resumes",  icon: <Briefcase size={18} />,       label: "Resume Tracker" },
  { href: "/dashboard/analytics",icon: <BarChart2 size={18} />,       label: "Analytics"      },
  { href: "/",                   icon: <Sparkles size={18} />,        label: "New Interview"  },
];

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export default function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
          <FileText size={16} className="text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">AI Interviewer</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-3 mb-3">
          Menu
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? "bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-600/20 text-white border border-white/10"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
            >
              <span className={`${isActive ? "text-orange-400" : "text-slate-400 group-hover:text-white"} transition-colors`}>
                {item.icon}
              </span>
              {item.label}
              {isActive && <ChevronRight size={14} className="ml-auto text-orange-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/10 mb-2">
          {/* Avatar */}
          {user.image ? (
            <Image src={user.image} alt={user.name || "User"} width={32} height={32} className="rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user.name || "User"}</p>
            <p className="text-slate-400 text-xs truncate">{user.email}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-slate-900 text-white shadow-lg"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile sidebar (slide-in) ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-slate-900 z-50 transform transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Desktop sidebar (fixed) ── */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-slate-900 border-r border-white/5 flex-shrink-0 min-h-screen">
        <SidebarContent />
      </aside>
    </>
  );
}
