import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function verify() {
  console.log("=== 1. Testing Login API ===");
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      login: "demo@tamilthadam.org",
      password: "TamilThadamPassword123!",
      rememberMe: true,
    }),
  });

  const loginData = await loginRes.json();
  const setCookie = loginRes.headers.get("set-cookie");
  console.log("Login Response:", {
    status: loginRes.status,
    success: loginData.success,
    user: loginData.user,
    tokenReceived: !!loginData.token,
    hasCookie: !!setCookie,
  });

  if (!loginData.success) {
    console.error("Login failed!");
    return;
  }

  // Extract token from cookie or response
  const cookieHeader = setCookie ? setCookie.split(";")[0] : `tt_auth_token=${loginData.token}`;

  console.log("\n=== 2. Testing Session Validation (/api/auth/me) ===");
  const meRes = await fetch("http://localhost:3000/api/auth/me", {
    headers: {
      Cookie: cookieHeader,
    },
  });
  const meData = await meRes.json();
  console.log("Session verification:", meData);

  console.log("\n=== 3. Testing Registration of New User ===");
  const testEmail = `researcher_${Date.now()}@gmail.com`;
  const regRes = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "பேராசிரியர் கயல்விழி",
      emailOrUsername: testEmail,
      password: "TamilThadamSecret2026!",
      role: "researcher",
    }),
  });
  const regData = await regRes.json();
  console.log("Register Response:", {
    status: regRes.status,
    success: regData.success,
    user: regData.user,
  });

  console.log("\n=== 4. Testing Logout ===");
  const logoutRes = await fetch("http://localhost:3000/api/auth/logout", {
    method: "POST",
    headers: {
      Cookie: cookieHeader,
    },
  });
  const logoutData = await logoutRes.json();
  console.log("Logout Response:", logoutData);

  console.log("\n=== 5. Checking Session After Logout ===");
  const meAfterLogout = await fetch("http://localhost:3000/api/auth/me", {
    headers: {
      Cookie: cookieHeader,
    },
  });
  const meAfterData = await meAfterLogout.json();
  console.log("Session after logout:", meAfterData);
}

verify();
