import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("no key");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
  );
  const data = (await res.json()) as { models?: { name: string }[]; error?: unknown };
  if (data.error) {
    console.log(JSON.stringify(data.error));
    return;
  }
  for (const m of data.models || []) {
    const name = m.name.replace("models/", "");
    if (/flash|pro|gemini/i.test(name)) console.log(name);
  }
}

main();
