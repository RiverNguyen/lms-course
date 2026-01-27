import "server-only";
import { requireUser } from "./require-user";
import { prisma } from "@/lib/prisma";

export const getEnrolledCourse = async () => {
  const user = await requireUser();

  const data = await prisma.enrollment.findMany({
    where: {
      userId: user.id,
      status: 'Active',
    },
    select: {
      course: {
        select: {
          id: true,
          smallDescription: true,
          title: true,
          fileKey: true,
          level: true,
          slug: true,
          duration: true,
          chapters: {
            select: {
              id: true,
              lessons: {
                select: {
                  id: true,
                  lessonProgresses: {
                    where: {
                      userId: user.id,
                    },
                    select: {
                      completed: true,
                      lessonId: true,
                      id: true,
                    },
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  return data;
}

export type EnrolledCourseType = Awaited<ReturnType<typeof getEnrolledCourse>>[number];