# Production deployment runbook

This runbook prepares a controlled Vercel and Supabase launch. It does not certify legal compliance, DNS ownership, Stripe activation, SES production access, or backup availability. The business owner must confirm those items.

## Environments and secrets

Create separate Vercel Preview and Production values. Never copy live Stripe or customer data into Preview. Production startup rejects missing variables, non-HTTPS public/auth URLs, database URLs without `sslmode=require` or `sslmode=verify-full`, Stripe test keys, and placeholder email addresses.

- `DATABASE_URL`: Supabase transaction-pooler URL for Vercel runtime, normally port 6543, with `?sslmode=require&pgbouncer=true` where instructed by Supabase.
- `DIRECT_URL`: Supabase direct/session connection for controlled migrations and production seed, normally port 5432, with `?sslmode=require`. Never use it from request handlers.
- `AUTH_SECRET`: unique 32+ character random secret per environment.
- `AUTH_URL` and `NEXT_PUBLIC_SITE_URL`: exact HTTPS deployment origin.
- Configure all remaining variables from `.env.example`. Secrets must not use the `NEXT_PUBLIC_` prefix.

Vercel install command: `npm ci`. Build command: `npm run build`. `postinstall` runs `prisma generate`. Do not run migrations or seeds in the build command or from serverless instances.

## Controlled database deployment

Run once from protected CI or one authorised operator workstation:

```bash
npm ci
npm run db:validate
npm run db:status
npm run db:deploy
ALLOW_PRODUCTION_SEED=required-settings npm run db:seed:production
npm run db:status
```

The production seed creates only roles, permissions, EUR currency, and an explicitly unconfirmed VAT setting. It creates no users, products, orders, applications, or sample content. The development seed refuses to run with `NODE_ENV=production`.

Capture a Supabase backup and record migration status before deploying. Verify schema and application health before promoting traffic. Never launch two migration jobs concurrently.

## Vercel and domain

1. Deploy Preview with test Stripe keys, an isolated database, and restricted SES recipients.
2. Run `PLAYWRIGHT_BASE_URL=https://preview.example npm run test:e2e`.
3. Add the final domain, configure DNS, wait for a valid certificate, and verify HTTP redirects to HTTPS.
4. Add Preview and Production origins to Better Auth trusted origins.
5. Verify `/api/cron/reservations` is listed in Vercel Cron and protected by `CRON_SECRET`.
6. Promote the exact verified deployment; do not rebuild it with different variables after acceptance.

## Stripe live verification

Create `https://YOUR_DOMAIN/api/stripe/webhook` and subscribe to the checkout completion/failure, payment failure, and refund events used by the route. Store the live signing secret only in Production. The route verifies raw-body signatures, persists event IDs, rejects processed duplicates, and is the only path that marks an order paid; success pages are informational.

Record evidence for successful payment, failed payment, cancelled checkout, delayed and duplicate webhook delivery, expired checkout, partial refund, and full refund. Confirm standard and composite gift-box metadata contain internal order/line identifiers without customer secrets.

## SES and DNS

Verify the sending domain and sender, publish SES DKIM and SPF records, and start DMARC with monitored reporting before enforcement. Request SES production access and verify the account is out of sandbox. Route bounce and complaint events through SNS/EventBridge to the operations owner.

Test wholesale confirmation/admin notification, contact acknowledgement/admin notification, order and payment confirmation, shipping notification, password reset, and email verification. The provider retries three times and emits structured delivery events. Persistent email-delivery records and automated bounce suppression require a future schema/provider integration and remain a blocker if operational logs are insufficient.

## Monitoring and security

Set `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` to the project DSN. Configure `SENTRY_ORG`, `SENTRY_PROJECT` and the secret `SENTRY_AUTH_TOKEN` in protected CI for source-map upload. The SDK captures client, server, edge and router errors without default PII or session replay. Verify a deliberate test event in the production project before launch. Checkout, Stripe, email, background-job, contact, wholesale, gift-box, and reservation failures also use structured events. Logs redact secret-like keys and common credential formats.

Verify CSP and security headers against the final domain, Stripe, S3 and analytics. Run `npm audit --omit=dev` and review every production finding. Do not run `npm audit fix --force` without full regression testing.

## Backups and disaster recovery

- Confirm the Supabase plan’s backup retention and whether point-in-time recovery is enabled; do not assume either.
- Assign a recovery owner and agree business-approved RPO and RTO values.
- Enable S3 media versioning/retention and maintain an independent media export or replica.
- Quarterly, restore database and media into an isolated project, apply migrations once, verify representative orders and gift boxes, rotate restored secrets, and destroy the isolated environment.

Disaster checklist: declare incident, freeze writes, preserve logs, select a recovery point, restore database and media, apply migrations once, rotate secrets/webhooks, run smoke tests, reconcile Stripe events since the recovery point, reopen traffic gradually, and document the incident.

## Rollback

For application-only failures, use Vercel’s instant rollback to the previous accepted deployment. For schema issues, prefer forward fixes. Restore a backup only after stopping writes and planning Stripe reconciliation. Never roll application code back to a version incompatible with the deployed schema.

## Final evidence

Archive the deployment URL and commit, `db:status`, launch-readiness report, Stripe webhook delivery IDs, payment/refund evidence, SES message IDs, Playwright report, monitoring test event, backup/PITR confirmation, legal approval, shipping approval, and published-product approval.
