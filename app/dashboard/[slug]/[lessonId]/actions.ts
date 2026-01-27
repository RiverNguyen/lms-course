'use server'

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { checkCourseCompletionAndIssueCertificate } from "@/app/data/course/check-course-completion";

export const markLessonAsCompletedAction = async (lessonId: string, slug: string): Promise<ApiResponse & { courseCompleted?: boolean; certificateId?: string; nextLessonId?: string }> => {
  const session = await requireUser();

  try {
    // Get lesson to find courseId, chapterId, and position
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        position: true,
        chapter: {
          select: {
            id: true,
            position: true,
            courseId: true,
            course: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return {
        status: 'error',
        message: 'Lesson not found',
      };
    }

    // Mark lesson as completed
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.id,
          lessonId: lessonId,
        }
      },
      update: {
        completed: true,
      },
      create: {
        lessonId: lessonId,
        userId: session.id,
        completed: true,
      }
    });

    // Check if course is completed and issue certificate
    const completionResult = await checkCourseCompletionAndIssueCertificate(
      session.id,
      lesson.chapter.courseId
    );

    revalidatePath(`/dashboard/${slug}`);

    if (completionResult.isCompleted && completionResult.certificateId) {
      return {
        status: 'success',
        message: 'Chúc mừng! Bạn đã hoàn thành khóa học và nhận được chứng chỉ!',
        courseCompleted: true,
        certificateId: completionResult.certificateId,
      };
    }

    // Find next lesson
    let nextLessonId: string | undefined;

    // First, try to find next lesson in the same chapter
    const nextLessonInChapter = await prisma.lesson.findFirst({
      where: {
        chapterId: lesson.chapter.id,
        position: {
          gt: lesson.position,
        },
      },
      orderBy: {
        position: 'asc',
      },
      select: {
        id: true,
      },
    });

    if (nextLessonInChapter) {
      nextLessonId = nextLessonInChapter.id;
    } else {
      // If no next lesson in current chapter, find next chapter
      const nextChapter = await prisma.chapter.findFirst({
        where: {
          courseId: lesson.chapter.courseId,
          position: {
            gt: lesson.chapter.position,
          },
        },
        orderBy: {
          position: 'asc',
        },
        select: {
          id: true,
        },
      });

      if (nextChapter) {
        // Get first lesson of next chapter
        const firstLessonInNextChapter = await prisma.lesson.findFirst({
          where: {
            chapterId: nextChapter.id,
          },
          orderBy: {
            position: 'asc',
          },
          select: {
            id: true,
          },
        });

        if (firstLessonInNextChapter) {
          nextLessonId = firstLessonInNextChapter.id;
        }
      }
    }

    return {
      status: 'success',
      message: 'Lesson marked as completed',
      courseCompleted: false,
      nextLessonId,
    };
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    return {
      status: 'error',
      message: 'Failed to mark lesson as completed',
    };
  }
}