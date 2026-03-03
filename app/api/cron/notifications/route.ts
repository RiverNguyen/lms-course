import { NextRequest, NextResponse } from "next/server";
import {
  notifyCouponExpiring,
  notifyStudyReminder,
} from "@/app/data/notification/notification-service";
import { prisma } from "@/lib/prisma";

/**
 * Gọi bởi Vercel Cron (1 lần/ngày, 20:00 VN) hoặc cron bên ngoài.
 * Trên Vercel: thêm CRON_SECRET vào Environment Variables; Vercel gửi Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Coupon sắp hết hạn (trong 3 ngày)
    const inThreeDays = new Date();
    inThreeDays.setDate(inThreeDays.getDate() + 3);
    const coupons = await prisma.coupon.findMany({
      where: {
        active: true,
        endAt: { lte: inThreeDays, gte: new Date() },
      },
    });
    for (const coupon of coupons) {
      await notifyCouponExpiring(
        coupon.code,
        coupon.endAt,
        coupon.id
      ).catch((err) =>
        console.error("notifyCouponExpiring failed:", coupon.code, err)
      );
    }

    // Nhắc "Hôm nay chưa học"
    await notifyStudyReminder().catch((err) =>
      console.error("notifyStudyReminder failed:", err)
    );

    return NextResponse.json({
      ok: true,
      couponReminders: coupons.length,
    });
  } catch (error) {
    console.error("cron/notifications:", error);
    return NextResponse.json(
      { error: "Cron failed" },
      { status: 500 }
    );
  }
}
