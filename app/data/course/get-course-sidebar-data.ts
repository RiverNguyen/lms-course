import "server-only";
import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const getCourseSidebarData = async (slug: string) => {
  const session = await requireUser();

  const course = await prisma.course.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      title: true,
      fileKey: true,
      level: true,
      slug: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      chapters: {
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            select: {
              id: true,
              title: true,
              position: true,
              description: true,
              lessonProgresses: {
                where: {
                  userId: session.id,
                },
                select: {
                  completed: true,
                  lessonId: true,
                  id: true,
                },
              },
            },
            orderBy: {
              position: "asc",
            },
          }
        }
      }
    }
  })

  if (!course) {
    return notFound();
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.id,
        courseId: course.id,
      },
    }
  })

  if (!enrollment || (enrollment.status !== 'Active' && enrollment.status !== 'Completed')) {
    return notFound();
  }

  return {
    course,
  }
}

export type CourseSidebarData = Awaited<ReturnType<typeof getCourseSidebarData>>;