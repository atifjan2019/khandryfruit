import "server-only";

import Stripe from "stripe";
import { env } from "@/lib/env";

let instance: Stripe | undefined;

export function getStripe() {
  if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_NOT_CONFIGURED");
  instance ??= new Stripe(env.STRIPE_SECRET_KEY, {
    appInfo: { name: "Khan Dry Fruit", version: "0.1.0" },
    maxNetworkRetries: 2,
  });
  return instance;
}
