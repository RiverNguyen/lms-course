import { prisma } from "@/lib/prisma";
import { NotificationType } from "@/lib/generated/prisma/enums";
import { createNotificationsForUserIds } from "./create-notification";
import { createNotification } from "./create-notification";

const BATCH_SIZE = 100;

/** Gửi thông báo "Khóa mới" cho tất cả user (hoặc batch). */
export async function notifyNewCourse(courseTitle: string, courseSlug: string) {
  const userIds = await prisma.user.findMany({
    where: { banned: { not: true } },
    select: { id: true },
    take: 500,
  });
  const ids = userIds.map((u) => u.id);

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    await createNotificationsForUserIds(batch, {
      type: NotificationType.NewCourse,
      title: "Khóa học mới",
      body: `"${courseTitle}" vừa được xuất bản. Khám phá ngay!`,
      linkUrl: `/courses/${courseSlug}`,
    });
  }
}

/** Gửi thông báo "Coupon sắp hết hạn" cho admin. */
export async function notifyCouponExpiring(
  couponCode: string,
  endAt: Date,
  couponId?: string
) {
  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: { id: true },
  });
  const endStr = endAt.toLocaleDateString("vi-VN");
  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      type: NotificationType.CouponExpiring,
      title: "Mã giảm giá sắp hết hạn",
      body: `Mã "${couponCode}" hết hạn vào ${endStr}.`,
      linkUrl: couponId ? `/admin/coupons/${couponId}/edit` : "/admin/coupons",
    });
  }
}

/** Gửi thông báo "Hôm nay chưa học" cho user có enrollment nhưng chưa có lesson progress hôm nay. */
export async function notifyStudyReminder() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const enrolledUserIds = await prisma.enrollment.findMany({
    where: { status: { in: ["Active", "Completed"] } },
    select: { userId: true },
    distinct: ["userId"],
  });
  const userIds = [...new Set(enrolledUserIds.map((e) => e.userId))];

  const usersWithProgressToday = await prisma.lessonProgress.findMany({
    where: { updatedAt: { gte: todayStart } },
    select: { userId: true },
    distinct: ["userId"],
  });
  const studiedToday = new Set(usersWithProgressToday.map((p) => p.userId));

  const toNotify = userIds.filter((id) => !studiedToday.has(id));
  for (const userId of toNotify) {
    await createNotification({
      userId,
      type: NotificationType.StudyReminder,
      title: "Nhắc học",
      body: "Hôm nay bạn chưa học bài nào. Dành vài phút để ôn tập nhé!",
      linkUrl: "/dashboard",
    });
  }
}
