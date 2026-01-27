import { prisma } from "@/lib/prisma";

export const getFeaturedCourses = async (limit: number = 5) => {
  const data = await prisma.course.findMany({
    where: {
      status: "Published",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    select: {
      title: true,
      price: true,
      smallDescription: true,
      slug: true,
      fileKey: true,
      id: true,
      level: true,
      duration: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return data;
};

export type FeaturedCoursesType = Awaited<ReturnType<typeof getFeaturedCourses>>[number];
