// src/app/login/page.tsx
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

// Opt the segment out of instant-navigation validation as instructed by Next.js
export const instant = false;

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#2B1810] text-[#FDF8EE]">
          <div className="w-12 h-12 border-4 border-[#D4A017]/30 border-t-[#D4A017] rounded-full animate-spin mb-4" />
          <p className="text-sm text-[#F5D98B]">பக்கம் தயாராகிறது...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
