import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1).optional(),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: optionalUrl,
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  AWS_REGION: z.string().default("eu-central-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_ENDPOINT: optionalUrl,
  AWS_SES_FROM_EMAIL: z.string().email().optional().or(z.literal("")),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(["de", "en"]).default("de"),
  ADMIN_EMAIL: z.string().email().default("orders@example.com"),
  WHATSAPP_NUMBER: z
    .string()
    .regex(/^\d{8,15}$/)
    .default("4917621809185"),
  CRON_SECRET: z.string().min(24).optional(),
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  GOOGLE_SITE_VERIFICATION: z.string().optional(),
  META_PIXEL_ID: z.string().optional(),
  TIKTOK_PIXEL_ID: z.string().optional(),
  SENTRY_DSN: optionalUrl,
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment configuration: ${z.prettifyError(parsed.error)}`,
  );
}

export const env = parsed.data;

export function assertProductionEnvironment() {
  if (env.NODE_ENV !== "production") return;

  const missing = [
    ["DATABASE_URL", env.DATABASE_URL],
    ["BETTER_AUTH_SECRET", env.BETTER_AUTH_SECRET],
    ["STRIPE_SECRET_KEY", env.STRIPE_SECRET_KEY],
    ["STRIPE_WEBHOOK_SECRET", env.STRIPE_WEBHOOK_SECRET],
    ["AWS_SES_FROM_EMAIL", env.AWS_SES_FROM_EMAIL],
  ].filter(([, value]) => !value);

  if (missing.length) {
    throw new Error(
      `Missing production variables: ${missing.map(([key]) => key).join(", ")}`,
    );
  }

  if (
    env.ADMIN_EMAIL === "orders@example.com" ||
    env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
  ) {
    throw new Error(
      "Production launch guard rejected development email or Stripe test credentials.",
    );
  }
}
