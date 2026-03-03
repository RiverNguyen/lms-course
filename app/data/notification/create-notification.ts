import { prisma } from "@/lib/prisma";
import { NotificationType } from "@/lib/generated/prisma/enums";

type CreateNotificationInput = {
  userId: string;
  type: (typeof NotificationType)[keyof typeof NotificationType];
  title: string;
  body?: string | null;
  linkUrl?: string | null;
};

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      linkUrl: input.linkUrl ?? null,
    },
  });
}

export async function createNotificationsForUserIds(
  userIds: string[],
  input: Omit<CreateNotificationInput, "userId">
) {
  if (userIds.length === 0) return [];
  return prisma.notification.createManyAndReturn({
    data: userIds.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      linkUrl: input.linkUrl ?? null,
    })),
  });
}
