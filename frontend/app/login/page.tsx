"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

type AuthMode = "signin" | "signup" | "reset";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  const switchMode = (newMode: AuthMode) => {
    if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    setMode(newMode);
    setMessage("");
    setIsError(false);
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setMessage("");
    setIsError(false);
    setIsLoading(true);

    const cleanEmail = email.trim();

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (error) {
          setMessage(error.message);
          setIsError(true);
          return;
        }

        if (data.session) {
          router.push("/dashboard");
          router.refresh();
          return;
        }

        setMessage("Account created. Check your inbox to verify your email.");
        setIsError(false);
        setPassword("");

        redirectTimeoutRef.current = setTimeout(() => {
          setMode("signin");
          setMessage("");
        }, 3500);
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setMessage(error.message);
          setIsError(true);
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
          }
        );

        if (error) {
          setMessage(error.message);
          setIsError(true);
          return;
        }

        setMessage("Password reset link sent. Please check your email.");
        setIsError(false);
      }
    } catch {
      setMessage("An unexpected error occurred. Please try again.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const copy = {
    signin: {
      title: "Sign in to your workspace",
      subtitle: "Enter your credentials to manage tasks and assignments",
      buttonText: "Sign in",
    },
    signup: {
      title: "Create your account",
      subtitle: "Get started with rule-based task allocation",
      buttonText: "Create account",
    },
    reset: {
      title: "Reset your password",
      subtitle: "We'll send a recovery link to your email address",
      buttonText: "Send reset link",
    },
  }[mode];

  // Overrides Chrome/Edge yellow autofill background to match dark slate inputs
  const autofillFix =
    "[&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#13141a] [&:-webkit-autofill]:[-webkit-text-fill-color:#f4f4f5] [&:-webkit-autofill]:caret-white";

  return (
    <div className="min-h-screen w-full bg-[#121318] text-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30">
      {/* Main Card matching sidebar surface palette */}
      <div className="w-full max-w-[420px] rounded-xl border border-[#262833] bg-[#181920] p-8 shadow-xl shadow-black/25">
        {/* Brand Lockup matching TaskAssigner sidebar */}
        <div className="flex items-center justify-center gap-3 mb-7 pb-6 border-b border-[#262833]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Zap className="h-4 w-4 fill-indigo-400/20" aria-hidden="true" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-white leading-tight">
              TaskAssigner
            </div>
            <div className="text-xs text-zinc-400 leading-tight mt-0.5">
              Rule-based allocation
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-white">
            {copy.title}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-400">{copy.subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2"
            >
              Email Address
            </label>
            <div className="flex items-center gap-3 px-3.5 rounded-lg border border-[#2a2d3a] bg-[#13141a] transition-colors focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
              <Mail
                className="h-4 w-4 shrink-0 text-zinc-500"
                aria-hidden="true"
              />
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                className={`w-full py-2.5 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-50 ${autofillFix}`}
              />
            </div>
          </div>

          {/* Password Field */}
          {mode !== "reset" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
                >
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => switchMode("reset")}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none focus:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 px-3.5 rounded-lg border border-[#2a2d3a] bg-[#13141a] transition-colors focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
                <Lock
                  className="h-4 w-4 shrink-0 text-zinc-500"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                  disabled={isLoading}
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  className={`w-full py-2.5 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-50 ${autofillFix}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {mode === "signup" && (
                <p className="mt-1.5 text-xs text-zinc-500">
                  Must be at least 8 characters long.
                </p>
              )}
            </div>
          )}

          {/* Feedback Alert */}
          {message && (
            <div
              role={isError ? "alert" : "status"}
              className={`flex items-start gap-2.5 rounded-lg border p-3 text-xs leading-relaxed ${
                isError
                  ? "border-red-500/25 bg-red-500/10 text-red-300"
                  : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
              }`}
            >
              {isError ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              )}
              <span>{message}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group w-full flex items-center justify-center gap-2 py-2.5 px-4 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#181920] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{copy.buttonText}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Mode Switcher */}
        <div className="mt-6 pt-5 border-t border-[#262833] text-center text-xs text-zinc-400">
          {mode === "signin" && (
            <p>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none focus:underline cursor-pointer"
              >
                Create one
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none focus:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
          {mode === "reset" && (
            <p>
              Remembered your password?{" "}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none focus:underline cursor-pointer"
              >
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}