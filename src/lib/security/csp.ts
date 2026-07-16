const production = process.env.NODE_ENV === "production";

export function createCsp(nonce: string, strict: boolean) {
  const scripts = strict
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${production ? "" : " 'unsafe-eval'"} https://js.stripe.com https://www.googletagmanager.com`
    : `script-src 'self' 'unsafe-inline'${production ? "" : " 'unsafe-eval'"} https://js.stripe.com https://www.googletagmanager.com`;
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    scripts,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.amazonaws.com",
    "font-src 'self' data:",
    "connect-src 'self' https://*.ingest.sentry.io https://www.google-analytics.com https://*.google-analytics.com https://api.stripe.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
    "report-uri /api/csp-report",
  ].join("; ");
}

export function securityHeaders(nonce: string) {
  const strict = createCsp(nonce, true);
  const enforceStrict = process.env.CSP_ENFORCE_STRICT === "1";
  return {
    nonce,
    enforced: createCsp(nonce, enforceStrict),
    reportOnly: enforceStrict ? null : strict,
  };
}
