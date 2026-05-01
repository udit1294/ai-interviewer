"use client";

/**
 * ResumeUploadModal — Lightweight modal for uploading a resume
 * to the tracker WITHOUT starting an interview.
 *
 * Flow: Upload file → /api/resumes (parse + save to DB) → onSuccess(resumeId, jobTitle)
 * Does NOT redirect to /interview.
 */

import React, { useState, useRef } from "react";
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ResumeUploadModalProps {
  onClose: () => void;
  onSuccess: (resumeId: string, jobTitle: string) => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export default function ResumeUploadModal({ onClose, onSuccess }: ResumeUploadModalProps) {
  const [file, setFile]         = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [state, setState]       = useState<UploadState>("idle");
  const [error, setError]       = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);

  // ── File validation ──────────────────────────────────────────────────────────
  const validateAndSetFile = (f: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(f.type)) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }
    setFile(f);
    setError("");
  };

  const handleFileChange  = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndSetFile(f);
  };

  // ── Upload (save only — no interview redirect) ───────────────────────────────
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select a file first."); return; }
    if (!jobTitle.trim()) { setError("Please enter the target job title."); return; }

    setState("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobTitle", jobTitle.trim()); // pass title for tracker label

      const res = await fetch("/api/resumes", { method: "POST", body: formData });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Upload failed. Please try again.");
      }

      const dbResume = await res.json();
      if (!dbResume?.id) throw new Error("Unexpected response from server.");

      setState("success");

      // Brief success flash then notify parent
      setTimeout(() => {
        onSuccess(dbResume.id, jobTitle.trim());
        onClose();
      }, 1200);

    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  };

  // ── Close on Escape ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const isUploading = state === "uploading";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center">
              <Upload size={15} className="text-white" />
            </div>
            <h2 id="upload-modal-title" className="text-base font-bold text-gray-900">
              Upload Resume
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleUpload} className="px-6 py-5 space-y-4">

          {/* Job title */}
          <div>
            <label htmlFor="job-title" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Target Job Title <span className="text-red-400">*</span>
            </label>
            <input
              id="job-title"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              disabled={isUploading}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition placeholder-gray-300 disabled:opacity-60"
            />
          </div>

          {/* Drop zone */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Resume File <span className="text-red-400">*</span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !isUploading && inputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150
                ${state === "success"
                  ? "border-emerald-300 bg-emerald-50"
                  : dragOver
                  ? "border-purple-400 bg-purple-50"
                  : file
                  ? "border-purple-300 bg-purple-50/50"
                  : "border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-purple-50/30"
                }
                ${isUploading ? "pointer-events-none opacity-70" : ""}
              `}
            >
              {state === "success" ? (
                <>
                  <CheckCircle2 size={32} className="text-emerald-500" />
                  <p className="text-sm font-semibold text-emerald-700">Uploaded successfully!</p>
                </>
              ) : isUploading ? (
                <>
                  <Loader2 size={32} className="text-purple-400 animate-spin" />
                  <p className="text-sm text-purple-600 font-medium">Processing resume…</p>
                </>
              ) : file ? (
                <>
                  <FileText size={28} className="text-purple-500" />
                  <p className="text-sm font-semibold text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
                  </p>
                </>
              ) : (
                <>
                  <Upload size={28} className="text-gray-300" />
                  <p className="text-sm font-semibold text-gray-500">
                    Drop your resume here or <span className="text-purple-600">browse</span>
                  </p>
                  <p className="text-xs text-gray-400">PDF or DOCX · Max 10MB</p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Error */}
          {(error || state === "error") && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2.5">
              <AlertCircle size={13} className="flex-shrink-0" />
              {error || "Upload failed. Please try again."}
            </div>
          )}

          {/* Info note */}
          <p className="text-xs text-gray-400 text-center">
            This will save your resume to the tracker only.{" "}
            <span className="font-medium text-gray-500">No interview will start.</span>
          </p>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="" // uses form above
            disabled={!file || !jobTitle.trim() || isUploading || state === "success"}
            onClick={handleUpload}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isUploading
              ? <><Loader2 size={14} className="animate-spin" /> Uploading…</>
              : state === "success"
              ? <><CheckCircle2 size={14} /> Done!</>
              : <><Upload size={14} /> Save to Tracker</>
            }
          </button>
        </div>
      </div>
    </>
  );
}
