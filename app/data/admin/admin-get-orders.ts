import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/prisma";

export const adminGetOrders = async () => {
  await requireAdmin();

  const data = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
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

  return data;
};

export type AdminOrderType = Awaited<
  ReturnType<typeof adminGetOrders>
>[number];
