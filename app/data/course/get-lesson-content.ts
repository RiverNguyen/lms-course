import 'server-only'
import { requireUser } from '@/app/data/user/require-user';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export async function getLessonContent(lessonId: string) {
  const session = await requireUser();

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      thumbnailKey: true,
      videoKey: true,
      position: true,
      lessonProgresses: {
        where: {
          userId: session.id,
        },
        select: {
          completed: true,
          lessonId: true,
        }
      },
      chapter: {
        select: {
          courseId: true,
          course: {
            select: {
              slug: true,
            }
          }
        }
      }
    }
  })

  if (!lesson) {
    return notFound();
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.id,
        courseId: lesson.chapter.courseId,
      }
    },
    select: {
      status: true,
    }
  })

  if (!enrollment || (enrollment.status !== 'Active' && enrollment.status !== 'Completed')) {
    return notFound();
  }

  return lesson;
}

export type LessonContent = Awaited<ReturnType<typeof getLessonContent>>;