# Testing

`npm run test` runs Vitest unit tests for money, VAT, unit price, coupons, publication readiness and order transitions. `npm run typecheck` generates Next.js route types before strict TypeScript. `npm run test:e2e` covers bilingual browse and mobile/desktop projects; install browsers with `npx playwright install` first.

Before production, expand integration coverage against an isolated Supabase project for Better Auth registration/login, transaction contention, webhook replay, refund handling, admin mutations, CSV import, wholesale applications and privacy workflows. Run a complete Stripe test checkout and refund, keyboard-only journey, VoiceOver mobile Safari review, and physical-device checkout.
