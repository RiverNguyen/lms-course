"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

export type CreateCouponInput = {
  code: string;
  type: "Percent" | "Fixed";
  value: number;
  minPurchase?: number | null;
  maxUses?: number | null;
  startAt: Date;
  endAt: Date;
  active?: boolean;
};

export async function createCouponAction(
  input: CreateCouponInput
): Promise<ApiResponse & { couponId?: string }> {
  try {
    await requireAdmin();

    const code = input.code.trim().toUpperCase();
    if (!code) {
      return { status: "error", message: "Mã giảm giá không được để trống" };
    }

    const existing = await prisma.coupon.findUnique({
      where: { code },
    });
    if (existing) {
      return { status: "error", message: "Mã giảm giá đã tồn tại" };
    }

    if (input.type === "Percent" && (input.value < 1 || input.value > 100)) {
      return { status: "error", message: "Phần trăm giảm phải từ 1 đến 100" };
    }
    if (input.type === "Fixed" && input.value < 1) {
      return { status: "error", message: "Số tiền giảm phải lớn hơn 0" };
    }
    if (input.startAt >= input.endAt) {
      return { status: "error", message: "Ngày bắt đầu phải trước ngày kết thúc" };
    }

    let stripeCouponId: string | null = null;
    try {
      if (input.type === "Percent") {
        const coupon = await stripe.coupons.create({
          percent_off: Math.round(input.value),
          duration: "once",
        });
        stripeCouponId = coupon.id;
      } else {
        const coupon = await stripe.coupons.create({
          amount_off: Math.round(input.value),
          currency: "vnd",
          duration: "once",
        });
        stripeCouponId = coupon.id;
      }
    } catch (stripeError) {
      console.error("Stripe coupon creation failed:", stripeError);
      return {
        status: "error",
        message: "Không thể tạo mã giảm giá trên Stripe. Kiểm tra cấu hình Stripe.",
      };
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type: input.type,
        value: Math.round(input.value),
        minPurchase: input.minPurchase ?? null,
        maxUses: input.maxUses ?? null,
        startAt: input.startAt,
        endAt: input.endAt,
        active: input.active ?? true,
        stripeCouponId,
      },
    });

    revalidatePath("/admin/coupons");
    return { status: "success", message: "Đã tạo mã giảm giá", couponId: coupon.id };
  } catch (error) {
    console.error("Error creating coupon:", error);
    return { status: "error", message: "Không thể tạo mã giảm giá" };
  }
}

export type UpdateCouponInput = {
  active?: boolean;
  startAt?: Date;
  endAt?: Date;
  minPurchase?: number | null;
  maxUses?: number | null;
};

export async function updateCouponAction(
  couponId: string,
  data: UpdateCouponInput
): Promise<ApiResponse> {
  try {
    await requireAdmin();

    const updateData: Parameters<typeof prisma.coupon.update>[0]["data"] = {};
    if (data.active !== undefined) updateData.active = data.active;
    if (data.startAt !== undefined) updateData.startAt = data.startAt;
    if (data.endAt !== undefined) updateData.endAt = data.endAt;
    if (data.minPurchase !== undefined) updateData.minPurchase = data.minPurchase ?? null;
    if (data.maxUses !== undefined) updateData.maxUses = data.maxUses ?? null;

    const existing = await prisma.coupon.findUnique({
      where: { id: couponId },
      select: { startAt: true, endAt: true },
    });
    if (!existing) {
      return { status: "error", message: "Mã giảm giá không tồn tại" };
    }
    const finalStart = data.startAt ?? existing.startAt;
    const finalEnd = data.endAt ?? existing.endAt;
    if (finalStart >= finalEnd) {
      return { status: "error", message: "Ngày bắt đầu phải trước ngày kết thúc" };
    }

    await prisma.coupon.update({
      where: { id: couponId },
      data: updateData,
    });

    revalidatePath("/admin/coupons");
    revalidatePath(`/admin/coupons/${couponId}`);
    return { status: "success", message: "Đã cập nhật mã giảm giá" };
  } catch (error) {
    console.error("Error updating coupon:", error);
    return { status: "error", message: "Không thể cập nhật" };
  }
}

export async function deleteCouponAction(couponId: string): Promise<ApiResponse> {
  try {
    await requireAdmin();

    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      select: { stripeCouponId: true, usedCount: true },
    });
    if (!coupon) {
      return { status: "error", message: "Mã giảm giá không tồn tại" };
    }
    if (coupon.usedCount > 0) {
      return { status: "error", message: "Không thể xóa mã đã được sử dụng. Có thể tắt kích hoạt." };
    }

    await prisma.coupon.delete({
      where: { id: couponId },
    });

    if (coupon.stripeCouponId) {
      try {
        await stripe.coupons.del(coupon.stripeCouponId);
      } catch {
        // Stripe delete may fail if already used; ignore
      }
    }

    revalidatePath("/admin/coupons");
    return { status: "success", message: "Đã xóa mã giảm giá" };
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return { status: "error", message: "Không thể xóa" };
  }
}
