import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/prisma";

export const adminGetUsers = async () => {
  await requireAdmin();

  const data = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      banned: true,
      banReason: true,
      banExpires: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          courses: true,
          enrollments: true,
        },
      },
    },
  });

  return data;
};

export type AdminUserType = Awaited<
  ReturnType<typeof adminGetUsers>
>[number];
