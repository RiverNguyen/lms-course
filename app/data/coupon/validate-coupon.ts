import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Validate coupon by code and subtotal (in VND).
 * Returns discount amount in VND and coupon id for checkout, or null if invalid.
 */
export async function validateCoupon(
  code: string,
  subtotalVnd: number
): Promise<{
  valid: true;
  couponId: string;
  discountAmount: number;
  stripeCouponId: string;
  message: string;
} | { valid: false; message: string }> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, message: "Vui lòng nhập mã giảm giá" };
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: trimmed },
  });

  if (!coupon) {
    return { valid: false, message: "Mã giảm giá không tồn tại" };
  }

  if (!coupon.active) {
    return { valid: false, message: "Mã giảm giá đã bị vô hiệu hóa" };
  }

  const now = new Date();
  if (now < coupon.startAt) {
    return { valid: false, message: "Mã giảm giá chưa có hiệu lực" };
  }
  if (now > coupon.endAt) {
    return { valid: false, message: "Mã giảm giá đã hết hạn" };
  }

  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, message: "Mã giảm giá đã hết lượt sử dụng" };
  }

  if (coupon.minPurchase != null && subtotalVnd < coupon.minPurchase) {
    return {
      valid: false,
      message: `Đơn hàng tối thiểu ${coupon.minPurchase.toLocaleString("vi-VN")} VND để áp dụng mã`,
    };
  }

  let discountAmount: number;
  if (coupon.type === "Percent") {
    const percent = Math.min(100, Math.max(0, coupon.value));
    discountAmount = Math.round((subtotalVnd * percent) / 100);
  } else {
    discountAmount = Math.min(coupon.value, subtotalVnd);
  }

  if (discountAmount <= 0) {
    return { valid: false, message: "Không thể áp dụng giảm giá cho đơn hàng này" };
  }

  if (!coupon.stripeCouponId) {
    return { valid: false, message: "Mã giảm giá chưa được cấu hình thanh toán" };
  }

  return {
    valid: true,
    couponId: coupon.id,
    discountAmount,
    stripeCouponId: coupon.stripeCouponId,
    message: `Giảm ${discountAmount.toLocaleString("vi-VN")} VND`,
  };
}
