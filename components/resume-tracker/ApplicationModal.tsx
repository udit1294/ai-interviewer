"use client";

/**
 * ApplicationModal — Modal form to add a new job application to a resume.
 * Validates required fields, builds a new JobApplication object,
 * and fires onAdd so the parent can append it to state.
 */

import React, { useState, useEffect, useRef } from "react";
import { X, Briefcase, Building2, MapPin, DollarSign, Link as LinkIcon, Loader2 } from "lucide-react";
import { JobApplication, ApplicationStatus, STATUS_CONFIG, ALL_STATUSES } from "./types";

interface ApplicationModalProps {
  onAdd: (app: JobApplication) => void;
  onClose: () => void;
}

// ─── Reusable form field ───────────────────────────────────────────────────────
function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition placeholder-gray-300";

// ─── Main Modal ────────────────────────────────────────────────────────────────
export default function ApplicationModal({ onAdd, onClose }: ApplicationModalProps) {
  const [company,     setCompany]     = useState("");
  const [role,        setRole]        = useState("");
  const [status,      setStatus]      = useState<ApplicationStatus>("APPLIED");
  const [location,    setLocation]    = useState("");
  const [salary,      setSalary]      = useState("");
  const [url,         setUrl]         = useState("");
  const [notes,       setNotes]       = useState("");
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [submitting,  setSubmitting]  = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);

  // Auto-focus first field
  useEffect(() => { firstRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!company.trim()) errs.company = "Company is required";
    if (!role.trim())    errs.role    = "Role is required";
    if (url && !/^https?:\/\//.test(url)) errs.url = "Must start with http:// or https://";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    // Simulate short async (replace with API call in production)
    setTimeout(() => {
      const newApp: JobApplication = {
        id:          `app_${Date.now()}`,
        company:     company.trim(),
        role:        role.trim(),
        status,
        appliedDate: new Date().toISOString(),
        updatedAt:   new Date().toISOString(),
        location:    location.trim() || undefined,
        salary:      salary.trim()   || undefined,
        url:         url.trim()      || undefined,
        notes:       notes.trim()    || undefined,
      };
      onAdd(newApp);
      setSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center">
              <Briefcase size={15} className="text-white" />
            </div>
            <h2 id="modal-title" className="text-base font-bold text-gray-900">Add Application</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
            aria-label="Close modal"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

            {/* Company + Role */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Company" required>
                <div className="relative">
                  <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    ref={firstRef}
                    type="text"
                    value={company}
                    onChange={(e) => { setCompany(e.target.value); setErrors((p) => ({ ...p, company: "" })); }}
                    placeholder="Google"
                    className={`${inputCls} pl-8 ${errors.company ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                  />
                </div>
                {errors.company && <p className="text-xs text-red-500 mt-1">{errors.company}</p>}
              </Field>

              <Field label="Role" required>
                <div className="relative">
                  <Briefcase size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => { setRole(e.target.value); setErrors((p) => ({ ...p, role: "" })); }}
                    placeholder="Frontend Engineer"
                    className={`${inputCls} pl-8 ${errors.role ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                  />
                </div>
                {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
              </Field>
            </div>

            {/* Status */}
            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className={`${inputCls} cursor-pointer`}
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </Field>

            {/* Location + Salary */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Location">
                <div className="relative">
                  <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Remote"
                    className={`${inputCls} pl-8`}
                  />
                </div>
              </Field>
              <Field label="Salary">
                <div className="relative">
                  <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="$120k"
                    className={`${inputCls} pl-8`}
                  />
                </div>
              </Field>
            </div>

            {/* Job URL */}
            <Field label="Job Posting URL">
              <div className="relative">
                <LinkIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setErrors((p) => ({ ...p, url: "" })); }}
                  placeholder="https://jobs.example.com/123"
                  className={`${inputCls} pl-8 ${errors.url ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                />
              </div>
              {errors.url && <p className="text-xs text-red-500 mt-1">{errors.url}</p>}
            </Field>

            {/* Notes */}
            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Referral, recruiter name, interview prep notes…"
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Adding…</> : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
