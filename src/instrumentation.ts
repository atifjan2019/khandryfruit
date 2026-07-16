import type { Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
    const { assertProductionEnvironment } = await import("@/lib/env");
    assertProductionEnvironment();
  }
  if (process.env.NEXT_RUNTIME === "edge")
    await import("../sentry.edge.config");
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(error, request, context);
  const { logger } = await import("@/lib/logging/logger");
  logger.error("unhandled_request_error", {
    errorCode: error instanceof Error ? error.name : "UNKNOWN_ERROR",
    method: request.method,
    route: context.routePath,
    routeType: context.routeType,
  });
};
