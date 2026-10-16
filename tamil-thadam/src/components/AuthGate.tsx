// src/components/AuthGate.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (isLoading) return;

    if (!user && !isLoginPage) {
      // Unauthenticated visitor trying to access any page -> redirect to initial login page
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    } else if (user && isLoginPage) {
      // Already logged-in user visiting /login -> forward to home page
      router.replace("/");
    }
  }, [user, isLoading, isLoginPage, pathname, router]);

  // On login page, always render children directly so the segment is never dropped
  if (isLoginPage) {
    return <>{children}</>;
  }

  // On client, once loading completes and user is verified not logged in, show redirect spinner
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2B1810]">
        <div className="w-10 h-10 border-4 border-[#D4A017]/30 border-t-[#D4A017] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
