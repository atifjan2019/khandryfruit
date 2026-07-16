import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { rejectUntrustedOrigin } from "@/lib/security/origin";

const handlers = toNextJsHandler(auth);
export const GET = handlers.GET;

export async function POST(request: Request) {
  const originRejection = rejectUntrustedOrigin(request);
  if (originRejection) return originRejection;
  const rate = await checkRateLimit(
    `auth:${request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for") ?? "unknown"}`,
    { limit: 20, windowMs: 60_000 },
  );
  if (!rate.allowed)
    return Response.json(
      { code: "RATE_LIMITED", message: "Too many authentication attempts." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds), "Cache-Control": "no-store" } },
    );
  return handlers.POST(request);
}
