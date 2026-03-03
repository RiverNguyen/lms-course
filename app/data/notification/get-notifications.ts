import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function getNotifications(userId: string, cursor?: string) {
  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const nextCursor = items.length > PAGE_SIZE ? items[PAGE_SIZE - 1]?.id : null;
  const list = items.slice(0, PAGE_SIZE);

  return { list, nextCursor };
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}
