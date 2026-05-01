"use client";

/**
 * DownloadButton — Handles resume file download.
 * - If fileUrl exists → opens in new tab (Supabase/S3 signed URL)
 * - If no URL → shows toast-style error
 */

import React, { useState } from "react";
import { Download, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface DownloadButtonProps {
  fileUrl?: string;
  fileName?: string;
}

export default function DownloadButton({ fileUrl, fileName = "resume.pdf" }: DownloadButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleDownload = async () => {
    if (!fileUrl) {
      setState("error");
      setMsg("No file attached to this resume.");
      setTimeout(() => setState("idle"), 3000);
      return;
    }

    setState("loading");
    try {
      // Fetch the file and trigger browser download
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error("File not available");

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setState("success");
      setMsg("Download started!");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setMsg("Could not download file.");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        onClick={handleDownload}
        disabled={state === "loading"}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150
          ${state === "error"
            ? "bg-red-50 border-red-200 text-red-600"
            : state === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-600"
            : "bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {state === "loading" && <Loader2 size={12} className="animate-spin" />}
        {state === "success" && <CheckCircle2 size={12} />}
        {state === "error"   && <AlertCircle size={12} />}
        {state === "idle"    && <Download size={12} />}
        {state === "loading" ? "Downloading…" : state === "success" ? "Downloaded!" : state === "error" ? "Failed" : "Download"}
      </button>
      {msg && state !== "idle" && (
        <p className={`text-xs ${state === "error" ? "text-red-500" : "text-emerald-600"}`}>{msg}</p>
      )}
    </div>
  );
}
