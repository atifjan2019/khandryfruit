# Requirements matrix

| Requirement                  | Status                     | Module                                     | Tests                          | Configuration / business data              | Launch blocker |
| ---------------------------- | -------------------------- | ------------------------------------------ | ------------------------------ | ------------------------------------------ | -------------- |
| Next.js bilingual storefront | Implemented foundation     | `src/app/[locale]`, `messages`             | E2E browse/language            | Final copy/images                          | No             |
| PostgreSQL/Prisma domain     | Implemented                | `prisma/schema.prisma`, migration          | Schema validate                | Supabase URLs                              | Yes            |
| Better Auth and RBAC         | Implemented foundation     | `src/lib/auth`, policies, auth pages       | Typecheck; integration pending | Auth URL/secret, email verification sender | Yes            |
| Catalogue/variants/food data | Implemented foundation     | repository, schema, product pages          | Publication unit tests         | Complete verified product data             | Yes            |
| Cart/server totals           | Implemented                | Zustand cart, checkout service             | Money/tax tests                | Published products                         | Yes            |
| Stripe Checkout/webhooks     | Implemented foundation     | API checkout/webhook                       | Live integration pending       | Stripe keys/webhook                        | Yes            |
| Inventory reservations       | Implemented                | checkout transaction, cron, webhook        | Contention integration pending | Supabase + cron                            | Yes            |
| Customer accounts/orders     | Partial                    | auth/account, order schema                 | Integration pending            | Email delivery                             | Yes            |
| Wholesale/gift boxes/reviews | Data model + public states | Prisma/content pages                       | Pending                        | Business rules/content                     | Yes            |
| Admin dashboard/CRUD         | Partial                    | protected admin shell                      | Pending                        | Supabase/admin user                        | Yes            |
| CMS/blog/recipes/import      | Data model only            | Prisma                                     | Pending                        | Editorial workflow                         | Yes            |
| SEO/structured data          | Foundation implemented     | metadata, sitemap, robots, Product JSON-LD | Build                          | Final domain/content                       | Yes            |
| Legal/consent/privacy        | Placeholder structure      | content routes, schema                     | Pending                        | Counsel-approved text and CMP              | Yes            |
| Email/storage/shipping       | Provider interfaces        | `src/lib/email`, `storage`, `shipping`     | Pending                        | Provider credentials/contracts             | Yes            |
| Tests/CI/deployment          | Implemented foundation     | Vitest, Playwright, CI, docs               | 10 unit tests                  | CI secrets/preview DB                      | No             |

The application is not complete or production-ready while critical rows remain Partial or launch-blocked.
