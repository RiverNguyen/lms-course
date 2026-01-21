import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/prisma";

export const adminGetCategories = async () => {
  await requireAdmin();

  const data = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          courses: true,
        },
      },
    },
  });

  return data;
};

export type AdminCategoryType = Awaited<
  ReturnType<typeof adminGetCategories>
>[number];
