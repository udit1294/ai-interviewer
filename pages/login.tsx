/**
 * Login Page — Production-grade split-screen design
 * Left panel: marketing/branding content
 * Right panel: auth form with Google OAuth + credentials
 */

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

// ─── Reusable: Social OAuth Button ────────────────────────────────────────────
function SocialButton({
  onClick,
  icon,
  label,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Reusable: Input Field ─────────────────────────────────────────────────────
function InputField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
  rightElement,
  required,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  rightElement?: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {rightElement}
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 bg-white transition-all duration-200 outline-none
          ${error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          }`}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Reusable: Stat Card ───────────────────────────────────────────────────────
function StatCard({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/20">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-white font-bold text-lg leading-none">{value}</p>
        <p className="text-indigo-200 text-xs mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Reusable: Feature List Item ──────────────────────────────────────────────
function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-indigo-100 text-sm">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </span>
      {text}
    </li>
  );
}

// ─── Main Login Page ───────────────────────────────────────────────────────────
export default function Login() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Inline validation errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ── Frontend Validation ──────────────────────────────────────────────────────
  const validate = () => {
    let valid = true;
    if (!email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }
    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    } else {
      setPasswordError("");
    }
    return valid;
  };

  // ── Credentials Login Handler ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setServerError("Invalid email or password. Please try again.");
    } else {
      router.push("/");
    }
  };

  // ── Google OAuth Handler ─────────────────────────────────────────────────────
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">

      {/* ─── LEFT PANEL: Branding & Marketing ─────────────────────────────── */}
      <div className="relative lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 flex flex-col justify-between p-8 lg:p-12 overflow-hidden">

        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">AI Interviewer</span>
        </div>

        {/* Main marketing copy */}
        <div className="relative z-10 my-8 lg:my-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/90 text-xs font-medium">AI-Powered Interview Practice</span>
          </div>

          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Ace Your Next<br />
            Interview with <span className="text-yellow-300">AI</span>
          </h1>
          <p className="text-indigo-100 text-base lg:text-lg leading-relaxed mb-8 max-w-md">
            Real-time feedback, intelligent questions, and performance insights to help you land your dream role.
          </p>

          {/* Feature list */}
          <ul className="space-y-3 mb-10">
            <FeatureItem text="AI-generated role-specific questions" />
            <FeatureItem text="Real-time feedback & suggestions" />
            <FeatureItem text="Detailed performance analytics" />
          </ul>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard value="10K+" label="Users" icon="👥" />
            <StatCard value="50K+" label="Interviews" icon="💬" />
            <StatCard value="95%" label="Success Rate" icon="🏆" />
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
          <svg className="w-5 h-5 text-yellow-300 mb-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-white/90 text-sm leading-relaxed mb-4">
            "This platform helped me gain confidence and improve my answers. I cracked my dream company interview!"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
              SJ
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Sarah Johnson</p>
              <p className="text-indigo-200 text-xs">Software Engineer at Google</p>
            </div>
          </div>
        </div>

        {/* Trusted by logos */}
        <div className="relative z-10 mt-6">
          <p className="text-indigo-300 text-xs mb-3">Trusted by professionals from</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 items-center">
            {["Google", "Amazon", "Microsoft", "Airbnb", "Stripe"].map((co) => (
              <span key={co} className="text-white/50 text-sm font-semibold">{co}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Auth Form ────────────────────────────────────────── */}
      <div className="lg:w-1/2 bg-gray-50 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 lg:p-10">

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Welcome Back 👋
              </h2>
              <p className="text-gray-500 text-sm">
                Login to continue your interview practice
              </p>
            </div>

            {/* ── OAuth Buttons ── */}
            <div className="space-y-3 mb-6">
              {/* Google */}
              <SocialButton
                onClick={handleGoogleSignIn}
                disabled={loading}
                label="Continue with Google"
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                }
              />

              {/* LinkedIn (UI only — no provider configured) */}
              <SocialButton
                onClick={() => {}}
                disabled={true}
                label="Continue with LinkedIn (Coming soon)"
                icon={
                  <svg className="w-5 h-5" fill="#0077B5" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                }
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* ── Credentials Form ── */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Server error alert */}
              {serverError && (
                <div
                  role="alert"
                  className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {serverError}
                </div>
              )}

              {/* Email */}
              <InputField
                id="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Enter your email"
                error={emailError}
                required
              />

              {/* Password */}
              <InputField
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
                error={passwordError}
                required
                rightElement={
                  <button
                    type="button"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Forgot?
                  </button>
                }
              />

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                aria-label="Login"
                className="relative w-full py-3 px-4 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-500 mt-5">
              Don't have an account?{" "}
              <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                Sign up
              </a>
            </p>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-1.5 mt-6 text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs">Your data is secure and encrypted</span>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-gray-600">Terms</a>
            {" "}and{" "}
            <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
