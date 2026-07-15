import { z } from "zod";

export const localeSchema = z.enum(["de", "en"]);
export const cartLineSchema = z.object({
  variantId: z.string().min(1).max(128),
  quantity: z.number().int().min(1).max(20),
});
export const checkoutSchema = z.object({
  locale: localeSchema,
  email: z.string().email(),
  countryCode: z.literal("DE"),
  shippingMethodId: z.string().min(1),
  couponCode: z.string().trim().toUpperCase().max(32).optional(),
  legalAccepted: z.literal(true),
  lines: z.array(cartLineSchema).min(1).max(50),
});
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  phone: z.string().trim().max(30).optional(),
  orderNumber: z.string().trim().max(30).optional(),
  type: z.enum(["ORDER", "PRODUCT", "WHOLESALE", "OTHER"]),
  message: z.string().trim().min(10).max(2_000),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
});
export const wholesaleApplicationSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().email(),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/),
  businessAddress: z.string().trim().min(10).max(300),
  vatId: z.string().trim().max(30).optional(),
  registrationNumber: z.string().trim().max(60).optional(),
  businessType: z.string().trim().min(2).max(80),
  website: z.string().url().optional().or(z.literal("")),
  monthlyOrderVolume: z.string().trim().min(1).max(80),
  productsOfInterest: z.array(z.string()).min(1),
  deliveryCountries: z.array(z.string().length(2)).min(1),
  message: z.string().trim().max(2_000).optional(),
  agreement: z.literal(true),
});

export type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };
