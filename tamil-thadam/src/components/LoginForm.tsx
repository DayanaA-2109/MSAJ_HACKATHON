// src/components/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("from") || "/";

  const { login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const res = await login(loginInput, password, rememberMe);
        if (res.success) {
          router.replace(redirectTarget);
        } else {
          setError(res.message || "மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது");
        }
      } else {
        const res = await register(name, loginInput, password);
        if (res.success) {
          router.replace(redirectTarget);
        } else {
          setError(res.message || "பதிவு செய்வதில் பிழை ஏற்பட்டது");
        }
      }
    } catch (err: any) {
      setError(err?.message || "தொடர்பில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setMode("login");
    setLoginInput("demo@tamilthadam.org");
    setPassword("TamilThadamPassword123!");
    setError(null);
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Background with user's uploaded temple & stone inscription image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/login-bg.jpg"
          alt="தமிழ்த் தடம் வரலாற்று பின்னணி"
          fill
          priority
          className="object-cover object-center scale-105 filter brightness-75 contrast-110"
        />
        {/* Warm cultural overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B05] via-[#2B1810]/75 to-[#1A0B05]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,160,23,0.18)_0%,rgba(26,11,5,0.85)_80%)]" />
      </div>

      {/* Decorative Traditional Border Elements */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B1E1E] via-[#D4A017] to-[#8B1E1E] z-10 opacity-80" />

      {/* Central Glassmorphic Card */}
      <div className="relative z-20 w-full max-w-md mx-auto">
        <div className="backdrop-blur-xl bg-[#201008]/85 border border-[#D4A017]/40 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-[#FDF8EE] relative">
          {/* Top Brass Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />

          {/* Kolam / Temple Header Motif */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#8B1E1E] to-[#551010] border-2 border-[#D4A017] shadow-lg mb-3">
              <span className="text-2xl text-[#F5D98B] select-none">🏛️</span>
            </div>
            <h1 className="brand-tamil text-3xl font-bold tracking-tight text-[#F5D98B] drop-shadow-md">
              தமிழ்த் தடம்
            </h1>
            <p className="text-xs sm:text-sm text-[#FDF8EE]/80 mt-1 font-medium tracking-wide">
              வாய்மொழி வரலாற்றுக் காப்பகம்
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="h-px w-8 bg-[#D4A017]/50" />
              <span className="text-[11px] text-[#D4A017] uppercase tracking-wider font-semibold">
                பாதுகாக்கப்பட்ட நுழைவு வாயில்
              </span>
              <span className="h-px w-8 bg-[#D4A017]/50" />
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-lg bg-[#140803]/80 p-1 mb-6 border border-[#D4A017]/25">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                mode === "login"
                  ? "bg-gradient-to-r from-[#8B1E1E] to-[#701616] text-[#F5D98B] shadow-md border border-[#D4A017]/30"
                  : "text-[#FDF8EE]/70 hover:text-white"
              }`}
            >
              உள்நுழைக (Sign In)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                mode === "register"
                  ? "bg-gradient-to-r from-[#8B1E1E] to-[#701616] text-[#F5D98B] shadow-md border border-[#D4A017]/30"
                  : "text-[#FDF8EE]/70 hover:text-white"
              }`}
            >
              புதிய கணக்கு (Register)
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[#591010]/90 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
              <span className="text-base leading-none">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-[#F5D98B] mb-1.5">
                  முழுப் பெயர் (Full Name) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="எ.கா. பாரதி அல்லது த. இளங்கோ"
                    className="w-full px-3.5 py-2.5 bg-[#140803]/90 border border-[#D4A017]/30 rounded-lg text-sm text-[#FDF8EE] placeholder-[#FDF8EE]/40 focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017] focus:outline-none transition-all"
                  />
                  <span className="absolute right-3 top-2.5 text-[#D4A017]/60 text-sm">👤</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#F5D98B] mb-1.5">
                {mode === "login"
                  ? "மின்னஞ்சல் அல்லது பயனர் பெயர் (Email / Username) *"
                  : "மின்னஞ்சல் (Email) *"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder={
                    mode === "login"
                      ? "demo@tamilthadam.org அல்லது பயனர் பெயர்"
                      : "user@example.com"
                  }
                  className="w-full px-3.5 py-2.5 bg-[#140803]/90 border border-[#D4A017]/30 rounded-lg text-sm text-[#FDF8EE] placeholder-[#FDF8EE]/40 focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017] focus:outline-none transition-all"
                />
                <span className="absolute right-3 top-2.5 text-[#D4A017]/60 text-sm">✉️</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5D98B] mb-1.5">
                கடவுச்சொல் (Password) *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#140803]/90 border border-[#D4A017]/30 rounded-lg text-sm text-[#FDF8EE] placeholder-[#FDF8EE]/40 focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017] focus:outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "கடவுச்சொல்லை மறை" : "கடவுச்சொல்லைக் காட்டு"}
                  className="absolute right-3 top-2.5 text-[#D4A017]/70 hover:text-[#D4A017] text-xs font-medium cursor-pointer"
                >
                  {showPassword ? "மறை" : "பார்"}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#FDF8EE]/90">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D4A017]/50 bg-[#140803] text-[#8B1E1E] focus:ring-[#D4A017]"
                />
                <span>என்னை நினைவில் கொள் (Remember Me)</span>
              </label>
              <span className="text-[11px] text-[#D4A017]/80">
                கணினி அணைக்கப்பட்டாலும் சேமிக்கப்படும்
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-[#D4A017] via-[#E8B530] to-[#D4A017] text-[#2B1810] hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-[#D4A017]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#2B1810]/40 border-t-[#2B1810] rounded-full animate-spin" />
                  <span>சரிபார்க்கப்படுகிறது...</span>
                </>
              ) : mode === "login" ? (
                <>
                  <span>உள்நுழைக</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              ) : (
                <>
                  <span>கணக்கை உருவாக்கு</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* One-Click Quick Demo Login */}
          <div className="mt-6 pt-5 border-t border-[#D4A017]/25 text-center">
            <p className="text-xs text-[#FDF8EE]/70 mb-2">
              விரைவான பரிசோதனைக்கு மாதிரி கணக்கு (Demo Login):
            </p>
            <button
              type="button"
              onClick={handleDemoFill}
              className="w-full py-2 px-3 rounded-lg border border-[#D4A017]/50 bg-[#1A0B05]/60 hover:bg-[#D4A017]/10 text-xs font-medium text-[#F5D98B] transition-colors flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>🔑</span>
              <span>மாதிரி கணக்கை நிரப்புக (demo@tamilthadam.org)</span>
            </button>
          </div>

          {/* Database & Security Notice */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#FDF8EE]/60">
            <span className="text-[#34D399]">●</span>
            <span>தரவுத்தள சேமிப்பு (Supabase & Local DB Persistent Storage Active)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
