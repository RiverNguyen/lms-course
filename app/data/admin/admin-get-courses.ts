import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/prisma";

export const adminGetCourses = async () => {
  await requireAdmin();

  const data = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      smallDescription: true,
      duration: true,
      level: true,
      status: true,
      price: true,
      fileKey: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return data;
};

export type AdminCourseType = Awaited<
  ReturnType<typeof adminGetCourses>
>[number];
