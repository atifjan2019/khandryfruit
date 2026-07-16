type LogFields = Record<string, string | number | boolean | null | undefined>;
const sensitiveValue =
  /(?:postgres(?:ql)?:\/\/|\b(?:sk|pk)_(?:live|test)_|\bwhsec_|\bBearer\s+|better-auth\.session_token)/i;
function write(
  level: "info" | "warn" | "error",
  event: string,
  fields: LogFields = {},
) {
  const safe = Object.fromEntries(
    Object.entries(fields)
      .filter(([key]) => !/password|secret|token|credential|cookie/i.test(key))
      .map(([key, value]) => [
        key,
        typeof value === "string" && sensitiveValue.test(value)
          ? "[REDACTED]"
          : value,
      ]),
  );
  console[level](
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      event,
      ...safe,
    }),
  );
}
export const logger = {
  info: (event: string, fields?: LogFields) => write("info", event, fields),
  warn: (event: string, fields?: LogFields) => write("warn", event, fields),
  error: (event: string, fields?: LogFields) => write("error", event, fields),
};
