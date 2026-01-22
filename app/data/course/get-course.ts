import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const getIndividualCourse = async (slug: string) => {
  const data = await prisma.course.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      title: true,
      description: true,
      fileKey: true,
      price: true,
      duration: true,
      level: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      smallDescription: true,
      chapters: {
        select: {
          id: true,
          title: true,
          lessons: {
            select: {
              id: true,
              title: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!data) {
    return notFound();
  }

  return data;
};

export type IndividualCourseType = Awaited<
  ReturnType<typeof getIndividualCourse>
>;
