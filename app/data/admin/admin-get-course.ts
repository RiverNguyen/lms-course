import "server-only";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const adminGetCourse = async (courseId: string) => {
  await requireAdmin();

  const data = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      fileKey: true,
      price: true,
      duration: true,
      level: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      smallDescription: true,
      slug: true,
      status: true,
      chapters: {
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            select: {
              id: true,
              title: true,
              description: true,
              thumbnailKey: true,
              videoKey: true,
              position: true,
            },
          },
        },
      },
    },
  });

  if (!data) {
    return notFound();
  }

  return data;
};

export type AdminCourseSingleType = Awaited<ReturnType<typeof adminGetCourse>>;
