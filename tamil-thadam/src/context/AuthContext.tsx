// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (login: string, pass: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, emailOrUser: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on mount (restores session even after browser/device turned off and on)
  const checkSession = useCallback(async () => {
    try {
      // 1. Instant check from localStorage for fast render
      if (typeof window !== "undefined") {
        const cachedUser = localStorage.getItem("tt_user");
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch {}
        }
      }

      // 2. Validate with server /api/auth/me (validates session token / cookie)
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (data.authenticated && data.user) {
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("tt_user", JSON.stringify(data.user));
        }
      } else {
        // Double check Supabase client's own persistent session
        const { data: supaSession } = await supabase.auth.getSession();
        if (supaSession?.session?.user) {
          const supaUser: AuthUser = {
            id: supaSession.session.user.id,
            email: supaSession.session.user.email || "",
            name:
              (supaSession.session.user.user_metadata?.name as string) ||
              (supaSession.session.user.user_metadata?.full_name as string) ||
              "பயனர்",
            role: (supaSession.session.user.user_metadata?.role as string) || "contributor",
          };
          setUser(supaUser);
          if (typeof window !== "undefined") {
            localStorage.setItem("tt_user", JSON.stringify(supaUser));
          }
        } else {
          setUser(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("tt_user");
            localStorage.removeItem("tt_token");
          }
        }
      }
    } catch (err) {
      console.warn("Failed to check auth session:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();

    // Listen to Supabase auth events
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("tt_user");
          localStorage.removeItem("tt_token");
        }
      } else if (session?.user && event === "SIGNED_IN") {
        const u: AuthUser = {
          id: session.user.id,
          email: session.user.email || "",
          name:
            (session.user.user_metadata?.name as string) ||
            (session.user.user_metadata?.full_name as string) ||
            "பயனர்",
          role: (session.user.user_metadata?.role as string) || "contributor",
        };
        setUser(u);
        if (typeof window !== "undefined") {
          localStorage.setItem("tt_user", JSON.stringify(u));
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkSession]);

  const login = async (loginInput: string, pass: string, rememberMe: boolean = true) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: loginInput, password: pass, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || "உள்நுழைவு தோல்வியடைந்தது" };
      }

      setUser(data.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("tt_user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("tt_token", data.token);
        }
      }

      // Also sign in Supabase client if possible (ignoring errors since local server session is set)
      const targetEmail = loginInput.includes("@") ? loginInput : `${loginInput}@tamilthadam.org`;
      supabase.auth.signInWithPassword({ email: targetEmail, password: pass }).catch(() => {});

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || "இணைப்பில் பிழை ஏற்பட்டது" };
    }
  };

  const registerUser = async (name: string, emailOrUser: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emailOrUsername: emailOrUser, password: pass }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || "பதிவு செய்தல் தோல்வியடைந்தது" };
      }

      setUser(data.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("tt_user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("tt_token", data.token);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || "இணைப்பில் பிழை ஏற்பட்டது" };
    }
  };

  const logout = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("tt_token") : null;
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("tt_user");
        localStorage.removeItem("tt_token");
      }
      try {
        await supabase.auth.signOut();
      } catch {}
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register: registerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
