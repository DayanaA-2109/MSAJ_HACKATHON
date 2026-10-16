// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionByToken, getLocalUsers, ensureDefaultUsers } from "@/lib/auth-store";

export async function GET(req: NextRequest) {
  try {
    await ensureDefaultUsers();

    // Check cookie first
    const cookieToken = req.cookies.get("tt_auth_token")?.value;

    // Check authorization header fallback
    const authHeader = req.headers.get("authorization");
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const session = await getSessionByToken(token);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const localUsers = await getLocalUsers();
    const user = localUsers.find((u) => u.id === session.userId) || {
      id: session.userId,
      email: session.email,
      username: session.email.split("@")[0],
      name: session.name,
      role: session.role,
    };

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error("Auth me check error:", error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
