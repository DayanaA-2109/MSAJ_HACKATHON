// src/lib/auth-store.ts
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { supabaseAdmin } from "./supabaseAdmin";
import { supabase } from "./supabaseClient";

export interface StoredUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: "admin" | "researcher" | "contributor" | "listener";
  createdAt: string;
  lastLoginAt?: string;
  passwordHash?: string; // fallback local hash
  salt?: string;
}

export interface ActiveSession {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  createdAt: number;
  expiresAt: number;
  rememberMe: boolean;
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const USERS_FILE = path.join(DATA_DIR, "users-db.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions-db.json");

// Ensure files exist
async function ensureAuthFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}

  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2), "utf-8");
  }

  try {
    await fs.access(SESSIONS_FILE);
  } catch {
    await fs.writeFile(SESSIONS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

// Hash password for local fallback
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

// Read all users from local DB
export async function getLocalUsers(): Promise<StoredUser[]> {
  await ensureAuthFiles();
  try {
    const raw = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Save users to local DB
export async function saveLocalUsers(users: StoredUser[]): Promise<void> {
  await ensureAuthFiles();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

// Read active sessions
export async function getActiveSessions(): Promise<ActiveSession[]> {
  await ensureAuthFiles();
  try {
    const raw = await fs.readFile(SESSIONS_FILE, "utf-8");
    const sessions: ActiveSession[] = JSON.parse(raw);
    const now = Date.now();
    // Filter out expired sessions
    return sessions.filter((s) => s.expiresAt > now);
  } catch {
    return [];
  }
}

// Save sessions
export async function saveActiveSessions(sessions: ActiveSession[]): Promise<void> {
  await ensureAuthFiles();
  await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf-8");
}

// Create or seed default admin/demo user
export async function ensureDefaultUsers(): Promise<void> {
  const users = await getLocalUsers();
  const demoEmail = "demo@tamilthadam.org";

  // Check if exists in Supabase
  try {
    const { data: authList } = await supabaseAdmin.auth.admin.listUsers();
    const supabaseDemo = authList?.users?.find((u) => u.email === demoEmail);

    if (!supabaseDemo) {
      await supabaseAdmin.auth.admin.createUser({
        email: demoEmail,
        password: "TamilThadamPassword123!",
        email_confirm: true,
        user_metadata: {
          name: "ஆய்வாளர் (Admin)",
          role: "admin",
          username: "demo",
        },
      });
    }
  } catch (err) {
    console.warn("Supabase user ensure warning:", err);
  }

  // Ensure in local DB
  const existsLocal = users.some((u) => u.email.toLowerCase() === demoEmail.toLowerCase());
  if (!existsLocal) {
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword("TamilThadamPassword123!", salt);
    users.push({
      id: "demo-user-1",
      email: demoEmail,
      username: "demo",
      name: "ஆய்வாளர் (Admin)",
      role: "admin",
      createdAt: new Date().toISOString(),
      salt,
      passwordHash,
    });
    await saveLocalUsers(users);
  }
}

// Authenticate user via Supabase or Local DB
export async function authenticate(
  loginInput: string,
  passwordInput: string
): Promise<{ user: StoredUser; token: string } | null> {
  await ensureDefaultUsers();
  const cleanLogin = loginInput.trim().toLowerCase();

  // If login doesn't have @, check if it's a known username or append domain
  let targetEmail = cleanLogin;
  let targetUser: StoredUser | null = null;

  const localUsers = await getLocalUsers();
  const foundByUsername = localUsers.find(
    (u) => u.username.toLowerCase() === cleanLogin || u.email.toLowerCase() === cleanLogin
  );

  if (foundByUsername) {
    targetEmail = foundByUsername.email;
    targetUser = foundByUsername;
  } else if (!cleanLogin.includes("@")) {
    targetEmail = `${cleanLogin}@tamilthadam.org`;
  }

  let authenticatedId: string | null = null;
  let authenticatedName: string = targetUser?.name || "பயனர்";
  let authenticatedRole: StoredUser["role"] = targetUser?.role || "contributor";

  // 1. Try Supabase Auth
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: passwordInput,
    });

    if (authData?.user && !authError) {
      authenticatedId = authData.user.id;
      authenticatedName =
        (authData.user.user_metadata?.name as string) ||
        (authData.user.user_metadata?.full_name as string) ||
        authenticatedName;
      authenticatedRole =
        (authData.user.user_metadata?.role as StoredUser["role"]) || authenticatedRole;
    }
  } catch (err) {
    console.warn("Supabase signIn attempt failed, checking local store...", err);
  }

  // 2. Fallback to local DB check if Supabase didn't authenticate
  if (!authenticatedId && targetUser && targetUser.passwordHash && targetUser.salt) {
    const computedHash = hashPassword(passwordInput, targetUser.salt);
    if (computedHash === targetUser.passwordHash) {
      authenticatedId = targetUser.id;
      authenticatedName = targetUser.name;
      authenticatedRole = targetUser.role;
    }
  }

  // If neither succeeded
  if (!authenticatedId) {
    return null;
  }

  // Sync / update last login
  const nowIso = new Date().toISOString();
  const existingIndex = localUsers.findIndex((u) => u.email.toLowerCase() === targetEmail.toLowerCase());
  const storedUserRecord: StoredUser = {
    id: authenticatedId,
    email: targetEmail,
    username: targetUser?.username || cleanLogin.split("@")[0],
    name: authenticatedName,
    role: authenticatedRole,
    createdAt: targetUser?.createdAt || nowIso,
    lastLoginAt: nowIso,
    salt: targetUser?.salt,
    passwordHash: targetUser?.passwordHash,
  };

  if (existingIndex >= 0) {
    localUsers[existingIndex] = { ...localUsers[existingIndex], ...storedUserRecord };
  } else {
    localUsers.push(storedUserRecord);
  }
  await saveLocalUsers(localUsers);

  // Generate session token
  const token = crypto.randomBytes(32).toString("hex");

  return {
    user: storedUserRecord,
    token,
  };
}

// Register user in both Supabase and Local DB
export async function register(
  name: string,
  emailOrUsername: string,
  passwordInput: string,
  role: StoredUser["role"] = "contributor"
): Promise<{ user: StoredUser; token: string }> {
  await ensureDefaultUsers();
  const cleanInput = emailOrUsername.trim().toLowerCase();
  const email = cleanInput.includes("@") ? cleanInput : `${cleanInput}@tamilthadam.org`;
  const username = cleanInput.includes("@") ? cleanInput.split("@")[0] : cleanInput;

  const localUsers = await getLocalUsers();
  if (localUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("இந்த மின்னஞ்சல் / பயனர் பெயர் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது (Account already exists)");
  }

  let userId = `user_${Date.now()}`;

  // 1. Create in Supabase Auth (confirmed immediately)
  try {
    const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: passwordInput,
      email_confirm: true,
      user_metadata: {
        name,
        username,
        role,
      },
    });

    if (newAuthUser?.user?.id) {
      userId = newAuthUser.user.id;
    } else if (authError) {
      console.warn("Supabase admin createUser warning:", authError.message);
    }
  } catch (err) {
    console.warn("Supabase registration fallback:", err);
  }

  // 2. Save in Local DB with salt & hash
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(passwordInput, salt);
  const newUser: StoredUser = {
    id: userId,
    email,
    username,
    name,
    role,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    salt,
    passwordHash,
  };

  localUsers.push(newUser);
  await saveLocalUsers(localUsers);

  const token = crypto.randomBytes(32).toString("hex");
  return { user: newUser, token };
}

// Create persistent session
export async function createAndSaveSession(
  user: StoredUser,
  token: string,
  rememberMe: boolean = true
): Promise<ActiveSession> {
  const sessions = await getActiveSessions();
  const now = Date.now();
  // 30 days if rememberMe, otherwise 7 days
  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const expiresAt = now + durationMs;

  const newSession: ActiveSession = {
    token,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: now,
    expiresAt,
    rememberMe,
  };

  // Remove any stale session with same token
  const filtered = sessions.filter((s) => s.token !== token);
  filtered.push(newSession);
  await saveActiveSessions(filtered);

  return newSession;
}

// Find session by token
export async function getSessionByToken(token: string): Promise<ActiveSession | null> {
  if (!token) return null;
  const sessions = await getActiveSessions();
  const session = sessions.find((s) => s.token === token && s.expiresAt > Date.now());
  return session || null;
}

// Invalidate session
export async function invalidateSession(token: string): Promise<void> {
  if (!token) return;
  const sessions = await getActiveSessions();
  const filtered = sessions.filter((s) => s.token !== token);
  await saveActiveSessions(filtered);
}
