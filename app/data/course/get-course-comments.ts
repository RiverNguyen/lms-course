import "server-only";
import { prisma } from "@/lib/prisma";

export const getCourseComments = async (courseId: string) => {
  const comments = await prisma.comment.findMany({
    where: {
      courseId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return comments;
};

export type CourseCommentType = Awaited<ReturnType<typeof getCourseComments>>[number];
