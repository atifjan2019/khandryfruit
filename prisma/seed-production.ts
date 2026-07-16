import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (process.env.ALLOW_PRODUCTION_SEED !== "required-settings")
  throw new Error(
    "Set ALLOW_PRODUCTION_SEED=required-settings for this controlled seed.",
  );
const connectionString = process.env.DIRECT_URL;
if (!connectionString)
  throw new Error("DIRECT_URL is required for the production seed.");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const roles = [
    "CUSTOMER",
    "WHOLESALE_CUSTOMER",
    "CONTENT_EDITOR",
    "ORDER_MANAGER",
    "ADMIN",
    "SUPER_ADMIN",
  ];
  const permissions = [
    "catalogue.read",
    "catalogue.write",
    "inventory.write",
    "orders.write",
    "content.write",
    "settings.write",
    "users.manage",
    "audit.read",
  ];
  await db.$transaction(async (tx) => {
    for (const name of roles)
      await tx.role.upsert({
        where: { name },
        update: {},
        create: { name, description: `${name.replaceAll("_", " ")} role` },
      });
    for (const key of permissions)
      await tx.permission.upsert({
        where: { key },
        update: {},
        create: { key },
      });
    await tx.siteSetting.upsert({
      where: { key: "commerce.currency" },
      update: {},
      create: {
        key: "commerce.currency",
        value: "EUR",
        type: "STRING",
        group: "commerce",
        public: true,
      },
    });
    await tx.siteSetting.upsert({
      where: { key: "commerce.vatMode" },
      update: {},
      create: {
        key: "commerce.vatMode",
        value: "UNCONFIRMED",
        type: "STRING",
        group: "commerce",
        public: false,
      },
    });
  });
  console.info("Production roles, permissions and required settings seeded.");
}

main()
  .catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : "Production seed failed",
    );
    process.exitCode = 1;
  })
  .finally(async () => db.$disconnect());
