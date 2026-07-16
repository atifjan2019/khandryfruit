import "dotenv/config";

import { productionEnvironmentIssues } from "../src/lib/env";

const issues = productionEnvironmentIssues();
if (issues.length) {
  console.error("Production environment validation failed:");
  for (const issue of issues) console.error(`- ${issue.key}: ${issue.reason}`);
  process.exitCode = 1;
} else {
  console.info("Production environment validation passed.");
}
