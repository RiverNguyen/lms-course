import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/prisma";

export const getUserOrders = async () => {
  const user = await requireUser();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      coupon: {
        select: {
          code: true,
          type: true,
          value: true,
        },
      },
      orderItems: true,
    },
  });

  return orders;
};

export type UserOrderType = Awaited<ReturnType<typeof getUserOrders>>[number];
