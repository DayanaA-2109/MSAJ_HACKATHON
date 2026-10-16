// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { invalidateSession } from "@/lib/auth-store";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("tt_auth_token")?.value;
    const body = await req.json().catch(() => ({}));
    const token = cookieToken || body?.token;

    if (token) {
      await invalidateSession(token);
    }

    try {
      await supabase.auth.signOut();
    } catch {}

    const response = NextResponse.json({
      success: true,
      message: "வெற்றிகரமாக வெளியேறிவிட்டீர்கள் (Logged out)",
    });

    response.cookies.set({
      name: "tt_auth_token",
      value: "",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: true });
  }
}
