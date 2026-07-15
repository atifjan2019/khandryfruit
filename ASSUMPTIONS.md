# Assumptions and unresolved decisions

- Business address, registration, register court, VAT ID, tax number, supervisory authority, LUCID and food-business registration are unknown and blocked from public output.
- VAT registration and applicable rates are not confirmed. Seed values are development examples, not tax advice.
- Exact product prices, ingredients, allergens, nutrition, responsible food business, shelf life, batches and images are unconfirmed. Seed products are `DRAFT`.
- Only these sourcing examples are treated as confirmed: figs/Kandahar, peaches/Logar, raisins/Kabul, mulberries/Shamali.
- No organic, halal, vegan, no-added-sugar, unsulphured, direct-trade, grower, fair-trade or health claim is public without verification.
- Germany is the only enabled shipping country. Mock €4.99 data and 3–4 day targets are development examples; public shipping promises remain disabled.
- Better Auth is used with Supabase PostgreSQL; Supabase Auth is intentionally not used.
- Vercel is the deployment target; Supabase hosts PostgreSQL. S3/SES remain the default production media/email abstractions unless the client selects alternatives.
- The placeholder email `orders@example.com` is rejected by the production launch guard.
- Opening hours are not published.
