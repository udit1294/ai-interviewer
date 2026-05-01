"use client";

/**
 * NotesEditor — Inline editable notes field.
 * Shows as read-only text, clicks into a textarea.
 * Calls onSave on blur or Ctrl+Enter. Persists per application.
 */

import React, { useState, useRef, useEffect } from "react";
import { FileText, Pencil, Check, X } from "lucide-react";

interface NotesEditorProps {
  notes?: string;
  onSave: (notes: string) => void;
}

export default function NotesEditor({ notes = "", onSave }: NotesEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(notes);
  const [saved, setSaved]     = useState(false);
  const textareaRef           = useRef<HTMLTextAreaElement>(null);

  // Sync external notes prop changes (e.g. reset)
  useEffect(() => { setDraft(notes); }, [notes]);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  const handleSave = () => {
    onSave(draft.trim());
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setDraft(notes); // revert
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSave();
    if (e.key === "Escape") handleCancel();
  };

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="mt-3 rounded-xl border border-purple-200 bg-white overflow-hidden">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add notes about this application…"
          rows={3}
          className="w-full px-3 py-2.5 text-xs text-gray-700 resize-none focus:outline-none placeholder-gray-300"
        />
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400">Ctrl+Enter to save · Esc to cancel</p>
          <div className="flex gap-1.5">
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              title="Cancel"
            >
              <X size={13} />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition"
            >
              <Check size={12} /> Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Read mode ──────────────────────────────────────────────────────────────
  return (
    <div
      onClick={() => setEditing(true)}
      className={`mt-3 flex items-start gap-1.5 rounded-xl px-3 py-2 cursor-pointer group transition-all
        ${saved ? "bg-emerald-50 border border-emerald-100" : "bg-gray-50 hover:bg-purple-50 border border-transparent hover:border-purple-100"}`}
      title="Click to edit notes"
    >
      <FileText size={11} className={`mt-0.5 flex-shrink-0 ${saved ? "text-emerald-500" : "text-gray-400 group-hover:text-purple-400"} transition-colors`} />
      <div className="flex-1 min-w-0">
        {draft ? (
          <p className="text-xs text-gray-500 leading-relaxed">{draft}</p>
        ) : (
          <p className="text-xs text-gray-300 italic">Click to add notes…</p>
        )}
        {saved && <p className="text-xs text-emerald-500 font-medium mt-0.5">✓ Saved</p>}
      </div>
      <Pencil size={11} className="text-gray-300 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-0.5" />
    </div>
  );
}
