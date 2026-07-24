import { CouponManager, type CouponRow } from "@/features/admin/coupon-manager";
import { db } from "@/lib/db/client";
import { requireAdmin } from "@/server/policies/authorization";

export default async function CouponsPage() {
  await requireAdmin("coupons");
  const coupons = await db.coupon.findMany({
    include: { _count: { select: { usages: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows: CouponRow[] = coupons.map((coupon) => ({
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    active: coupon.active,
    startsAt: coupon.startsAt?.toISOString() ?? null,
    expiresAt: coupon.expiresAt?.toISOString() ?? null,
    usageLimit: coupon.usageLimit,
    perCustomerLimit: coupon.perCustomerLimit,
    minimumOrderCents: coupon.minimumOrderCents,
    usageCount: coupon._count.usages,
  }));

  return <CouponManager coupons={rows} />;
}
