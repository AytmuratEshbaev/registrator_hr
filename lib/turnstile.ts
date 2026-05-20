interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
}

export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY is not set — skipping verification");
    return true;
  }

  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", token);
  if (ip) params.append("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: params,
    });
    const data = (await res.json()) as TurnstileResponse;
    return !!data.success;
  } catch (err) {
    console.error("[turnstile] verification failed:", err);
    return false;
  }
}
