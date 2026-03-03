import "server-only";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function adminGetCoupons() {
  await requireAdmin();

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return coupons;
}

export type AdminCoupon = Awaited<ReturnType<typeof adminGetCoupons>>[number];

export async function adminGetCoupon(couponId: string) {
  await requireAdmin();

  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
  });

  if (!coupon) {
    notFound();
  }

  return coupon;
}
