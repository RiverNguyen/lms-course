import { prisma } from "@/lib/prisma";

export const getAllCourses = async () => {
  const data = await prisma.course.findMany({
    where: {
      status: "Published",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      title: true,
      price: true,
      smallDescription: true,
      slug: true,
      fileKey: true,
      id: true,
      level: true,
      duration: true,
      category: true,
    },
  });

  return data;
};

export type AllCoursesType = Awaited<ReturnType<typeof getAllCourses>>[number];
