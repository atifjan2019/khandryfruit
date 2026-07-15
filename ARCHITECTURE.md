# Architecture

## Boundaries

- `src/app`: Next.js App Router pages and route handlers. Locale storefront routes use `/de` and `/en`; `/admin` and `/api` are unprefixed.
- `src/components`: accessible layout, storefront and UI components.
- `src/features`: browser interaction islands such as persisted guest cart and auth forms.
- `src/server/repositories`: database query mapping; presentation components do not issue Prisma queries directly.
- `src/server/services`: commerce workflows and server-controlled calculations.
- `src/server/policies`: session and role policies enforced on the server.
- `src/lib`: Prisma, Better Auth, Stripe, storage, email, shipping, validation, logging and domain rules.
- `prisma`: Prisma 7 schema, migration and idempotent seed.

## Data model

The model covers auth and RBAC; customers and addresses; translated products/categories; variants, nutrition, allergens, claims and certificates; versioned inventory and reservations; carts and wishlists; snapshot order items, addresses, payments, refunds and status history; shipping zones/rates/shipments; coupons; reviews; gift boxes; wholesale accounts/prices; blog, recipes and content blocks; legal content; consent/newsletter/contact data; settings, feature flags, redirects, media, audit logs and idempotent jobs.

Prices are integer euro cents. VAT rates are basis points. Available inventory is derived as `onHand - reserved`. Checkout reserves inventory with optimistic version checks inside a serializable transaction. Webhook confirmation converts reservations to sales; URL redirects never confirm payment.

## Vercel and Supabase

Vercel runs Next.js server components and route handlers. Prisma runtime uses Supabase's transaction pooler; migrations use the direct URL. The app is portable to another PostgreSQL provider. Vercel Cron calls the idempotent reservation-release route. Use a Frankfurt Vercel region near the Supabase project.

## Provider interfaces

Stripe, SES/console email, S3-compatible storage and mock shipping are isolated. Supabase Storage may be introduced through the `StorageProvider` interface without changing product or media workflows.
