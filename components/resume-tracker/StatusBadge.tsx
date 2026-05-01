"use client";

/**
 * StatusBadge — Color-coded badge with optional inline dropdown to change status
 */

import React, { useState, useRef, useEffect } from "react";
import { ApplicationStatus, STATUS_CONFIG, ALL_STATUSES } from "./types";
import { ChevronDown } from "lucide-react";

interface StatusBadgeProps {
  status: ApplicationStatus;
  editable?: boolean;
  onChange?: (status: ApplicationStatus) => void;
}

export default function StatusBadge({ status, editable = false, onChange }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const badge = (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
        ${cfg.bg} ${cfg.color} ${cfg.border}
        ${editable ? "cursor-pointer hover:opacity-80 transition-opacity pr-2" : ""}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
      {editable && <ChevronDown size={11} className="ml-0.5 opacity-60" />}
    </span>
  );

  if (!editable) return badge;

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen(!open)}>{badge}</div>

      {open && (
        <div className="absolute left-0 mt-1.5 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
          {ALL_STATUSES.map((s) => {
            const c = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => { onChange?.(s); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors
                  ${s === status ? `${c.bg} ${c.color}` : "text-gray-600 hover:bg-gray-50"}
                `}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                {c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
