# Security

- Better Auth sessions and role checks execute on the server. Proxy redirects are not trusted as authorization.
- Zod validates browser input; Prisma parameterizes database access; user-visible errors omit stack traces.
- Checkout accepts only variant IDs and quantities, reloads prices/stock, reserves stock transactionally, and uses Stripe idempotency keys.
- Webhooks require Stripe signature verification and persist event IDs before idempotent processing.
- Secrets are server-only. Logs filter password/secret/token/credential field names.
- Uploads are limited to image MIME types and 8 MB with generated storage keys. Add malware scanning before public production upload.
- Security headers disable framing, MIME sniffing and unnecessary browser permissions. Add a nonce-based CSP after final analytics/payment domains are known.
- Rotate Better Auth, Stripe, AWS and cron secrets after any suspected exposure. Revoke sessions after auth-secret incidents.
- Run `npm audit --audit-level=high` in CI. Current moderate issues must be reviewed before launch; do not use `npm audit fix --force` without regression testing.
- Privacy workflows must retain legally required invoice/order records while anonymising eligible profile data.
