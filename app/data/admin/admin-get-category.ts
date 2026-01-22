import "server-only";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const adminGetCategory = async (categoryId: string) => {
  await requireAdmin();

  const data = await prisma.category.findUnique({
    where: {
      id: categoryId,
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

  if (!data) {
    return notFound();
  }

  return data;
};

export type AdminCategorySingleType = Awaited<
  ReturnType<typeof adminGetCategory>
>;
