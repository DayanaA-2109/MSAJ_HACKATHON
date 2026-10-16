// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { register, createAndSaveSession } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, emailOrUsername, password, role = "contributor" } = body;

    if (!name || !emailOrUsername || !password) {
      return NextResponse.json(
        { success: false, message: "அனைத்து விவரங்களையும் நிரப்பவும் (All fields required)" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும் (Min 6 characters)" },
        { status: 400 }
      );
    }

    const { user, token } = await register(name, emailOrUsername, password, role);
    const session = await createAndSaveSession(user, token, true);

    const response = NextResponse.json({
      success: true,
      message: "கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது (Account created successfully)",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      token: session.token,
    });

    // 30 days persistent cookie
    response.cookies.set({
      name: "tt_auth_token",
      value: session.token,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "பதிவு செய்வதில் பிழை ஏற்பட்டது" },
      { status: 400 }
    );
  }
}
