// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticate, createAndSaveSession } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { login, password, rememberMe = true } = body;

    if (!login || !password) {
      return NextResponse.json(
        { success: false, message: "மின்னஞ்சல் மற்றும் கடவுச்சொல் தேவை (Email & password required)" },
        { status: 400 }
      );
    }

    const authResult = await authenticate(login, password);
    if (!authResult) {
      return NextResponse.json(
        { success: false, message: "மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது (Invalid credentials)" },
        { status: 401 }
      );
    }

    const session = await createAndSaveSession(authResult.user, authResult.token, rememberMe);

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days vs 7 days

    const response = NextResponse.json({
      success: true,
      message: "வெற்றிகரமாக உள்நுழைந்துள்ளீர்கள் (Login successful)",
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
        username: authResult.user.username,
        name: authResult.user.name,
        role: authResult.user.role,
      },
      token: session.token,
    });

    // Set persistent session cookie
    response.cookies.set({
      name: "tt_auth_token",
      value: session.token,
      httpOnly: false, // accessible to client for offline/boot sync
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "உள்நுழைவில் பிழை ஏற்பட்டது" },
      { status: 500 }
    );
  }
}
