import { prisma } from "@/lib/prisma";

export async function markNotificationRead(
  notificationId: string,
  userId: string
) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId },
    data: { read: true },
  });
}
