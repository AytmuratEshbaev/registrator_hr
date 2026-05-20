#!/usr/bin/env node
// Quick connectivity check: Supabase + R2.
// Usage: node scripts/verify-setup.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Manually load .env.local (no dotenv dependency)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");
const envText = readFileSync(envPath, "utf-8");
for (const line of envText.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim();
  if (!process.env[key]) process.env[key] = value;
}

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

const results = [];

function pass(name, details = "") {
  results.push({ ok: true, name, details });
  console.log(`${GREEN}✓${RESET} ${name}${details ? ` — ${details}` : ""}`);
}

function fail(name, error) {
  results.push({ ok: false, name, error });
  console.log(`${RED}✗${RESET} ${name}`);
  console.log(`  ${RED}${error}${RESET}`);
}

function warn(name, msg) {
  console.log(`${YELLOW}⚠${RESET} ${name} — ${msg}`);
}

// -------- 1. Supabase: lavozimlar -------
async function testSupabase() {
  console.log("\n── Supabase ──");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || url.includes("placeholder")) {
    fail("Supabase URL", "NEXT_PUBLIC_SUPABASE_URL placeholder");
    return;
  }
  if (!anon || anon.includes("placeholder")) {
    fail("Supabase anon key", "NEXT_PUBLIC_SUPABASE_ANON_KEY placeholder");
    return;
  }
  if (!svc || svc.includes("placeholder")) {
    fail("Supabase service role key", "SUPABASE_SERVICE_ROLE_KEY placeholder");
    return;
  }
  pass("Supabase env vars present");

  // Try fetching positions via REST (anon key)
  try {
    const res = await fetch(`${url}/rest/v1/positions?select=title&active=eq.true`, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` },
    });
    if (!res.ok) {
      fail("Supabase positions (anon)", `HTTP ${res.status}: ${await res.text()}`);
      return;
    }
    const positions = await res.json();
    if (!Array.isArray(positions) || positions.length === 0) {
      warn("Supabase positions", "Jadval bo'sh — schema.sql ishga tushganmi?");
    } else {
      pass(
        `Supabase positions table`,
        `${positions.length} ta lavozim: ${positions.map((p) => p.title).join(", ")}`
      );
    }
  } catch (err) {
    fail("Supabase connection", err.message);
  }

  // Try service role: count applications
  try {
    const res = await fetch(`${url}/rest/v1/applications?select=count`, {
      headers: {
        apikey: svc,
        Authorization: `Bearer ${svc}`,
        Prefer: "count=exact",
      },
    });
    if (!res.ok) {
      fail("Supabase applications (service role)", `HTTP ${res.status}: ${await res.text()}`);
      return;
    }
    const count = res.headers.get("content-range")?.split("/")[1] ?? "?";
    pass("Supabase applications table (service role)", `${count} ta yozuv`);
  } catch (err) {
    fail("Supabase service role", err.message);
  }
}

// -------- 2. R2: presigned URL hosil qilish va PUT qilish -------
async function testR2() {
  console.log("\n── Cloudflare R2 ──");
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const endpoint = process.env.R2_ENDPOINT;

  if (!accountId || accountId === "placeholder") {
    fail("R2_ACCOUNT_ID", "placeholder");
    return;
  }
  if (!accessKey || accessKey === "placeholder") {
    fail("R2_ACCESS_KEY_ID", "placeholder");
    return;
  }
  if (!secretKey || secretKey === "placeholder") {
    fail("R2_SECRET_ACCESS_KEY", "placeholder");
    return;
  }
  if (!bucket || !endpoint) {
    fail("R2 config", "R2_BUCKET_NAME yoki R2_ENDPOINT yo'q");
    return;
  }
  pass("R2 env vars present");

  // Validate endpoint format
  if (!endpoint.startsWith("https://") || !endpoint.includes(".r2.cloudflarestorage.com")) {
    fail("R2_ENDPOINT format", `Noto'g'ri format: ${endpoint}`);
    return;
  }
  if (!endpoint.includes(accountId)) {
    warn("R2_ENDPOINT", "Account ID endpoint ichida ko'rinmadi — ehtimol noto'g'ri");
  }

  // Dynamic import (we know it's installed)
  let S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, getSignedUrl;
  try {
    const s3mod = await import("@aws-sdk/client-s3");
    S3Client = s3mod.S3Client;
    PutObjectCommand = s3mod.PutObjectCommand;
    GetObjectCommand = s3mod.GetObjectCommand;
    DeleteObjectCommand = s3mod.DeleteObjectCommand;
    const presigner = await import("@aws-sdk/s3-request-presigner");
    getSignedUrl = presigner.getSignedUrl;
  } catch (err) {
    fail("AWS SDK import", err.message);
    return;
  }

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });

  const testKey = `_health-check/test-${Date.now()}.txt`;
  const testBody = "hello from verify-setup script";

  // Generate presigned PUT URL
  let putUrl;
  try {
    putUrl = await getSignedUrl(
      client,
      new PutObjectCommand({ Bucket: bucket, Key: testKey, ContentType: "text/plain" }),
      { expiresIn: 60 }
    );
    pass("R2 presigned PUT URL hosil bo'ldi");
  } catch (err) {
    fail("R2 presigned URL", err.message);
    return;
  }

  // Upload using the presigned URL (browser path)
  try {
    const res = await fetch(putUrl, {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
      body: testBody,
    });
    if (!res.ok) {
      fail("R2 PUT (presigned)", `HTTP ${res.status}: ${await res.text()}`);
      return;
    }
    pass("R2 PUT muvaffaqiyatli", `bucket=${bucket}, key=${testKey}`);
  } catch (err) {
    fail("R2 PUT", err.message);
    return;
  }

  // Download via presigned GET
  try {
    const getUrl = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: bucket, Key: testKey }),
      { expiresIn: 60 }
    );
    const res = await fetch(getUrl);
    if (!res.ok) {
      fail("R2 GET (presigned)", `HTTP ${res.status}`);
      return;
    }
    const text = await res.text();
    if (text === testBody) {
      pass("R2 GET muvaffaqiyatli", `mazmun mos`);
    } else {
      fail("R2 GET", `mazmun mos kelmadi: kutilgan "${testBody}", olingan "${text}"`);
    }
  } catch (err) {
    fail("R2 GET", err.message);
  }

  // Cleanup
  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: testKey }));
    pass("R2 DELETE (cleanup)");
  } catch (err) {
    warn("R2 cleanup", `test fayli o'chmadi: ${err.message}`);
  }
}

// -------- Run -------
console.log("HR Registratsiya — sozlamalar tekshiruvi\n");
await testSupabase();
await testR2();

const failed = results.filter((r) => !r.ok);
console.log("\n──────────────────────────────────────");
if (failed.length === 0) {
  console.log(`${GREEN}✓ Hammasi joyida! ${results.length} ta tekshirishlardan o'tildi.${RESET}`);
  console.log("\nEndi `npm run dev` ishga tushiring va loyihani sinab ko'ring.");
  process.exit(0);
} else {
  console.log(`${RED}✗ ${failed.length} ta xato topildi.${RESET}`);
  process.exit(1);
}
