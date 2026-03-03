'use server'

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { checkCourseCompletionAndIssueCertificate } from "@/app/data/course/check-course-completion";

// --- Lesson Note ---
export const saveLessonNoteAction = async (lessonId: string, content: string, slug: string): Promise<ApiResponse> => {
  try {
    const session = await requireUser();

    await prisma.lessonNote.upsert({
      where: {
        userId_lessonId: {
          userId: session.id,
          lessonId,
        },
      },
      update: { content: content.slice(0, 50000) },
      create: {
        userId: session.id,
        lessonId,
        content: content.slice(0, 50000),
      },
    });

    revalidatePath(`/dashboard/${slug}/${lessonId}`);
    return { status: "success", message: "Đã lưu ghi chú" };
  } catch (error) {
    console.error("Error saving lesson note:", error);
    return { status: "error", message: "Không thể lưu ghi chú" };
  }
};

// --- Lesson Bookmarks ---
export const addLessonBookmarkAction = async (
  lessonId: string,
  timestamp: number,
  label: string | null,
  slug: string
): Promise<ApiResponse> => {
  try {
    const session = await requireUser();
    const roundedTimestamp = Math.max(0, Math.floor(timestamp));

    await prisma.lessonBookmark.create({
      data: {
        userId: session.id,
        lessonId,
        timestamp: roundedTimestamp,
        label: label?.trim().slice(0, 200) ?? null,
      },
    });

    revalidatePath(`/dashboard/${slug}/${lessonId}`);
    return { status: "success", message: "Đã thêm bookmark" };
  } catch (error) {
    console.error("Error adding bookmark:", error);
    return { status: "error", message: "Không thể thêm bookmark" };
  }
};

export const deleteLessonBookmarkAction = async (
  bookmarkId: string,
  slug: string,
  lessonId: string
): Promise<ApiResponse> => {
  try {
    const session = await requireUser();

    await prisma.lessonBookmark.deleteMany({
      where: {
        id: bookmarkId,
        userId: session.id,
        lessonId,
      },
    });

    revalidatePath(`/dashboard/${slug}/${lessonId}`);
    return { status: "success", message: "Đã xóa bookmark" };
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return { status: "error", message: "Không thể xóa bookmark" };
  }
};

// --- Search notes in course ---
export const searchLessonNotesInCourseAction = async (
  courseSlug: string,
  query: string
): Promise<{ status: "success"; items: Awaited<ReturnType<typeof import("@/app/data/course/search-lesson-notes").searchLessonNotes>> } | { status: "error"; message: string }> => {
  try {
    const session = await requireUser();

    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true },
    });
    if (!course) {
      return { status: "error", message: "Không tìm thấy khóa học" };
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: session.id, courseId: course.id },
      },
      select: { status: true },
    });
    if (!enrollment || (enrollment.status !== "Active" && enrollment.status !== "Completed")) {
      return { status: "error", message: "Bạn chưa đăng ký khóa học này" };
    }

    const { searchLessonNotes } = await import("@/app/data/course/search-lesson-notes");
    const items = await searchLessonNotes(course.id, query);
    return { status: "success", items };
  } catch (error) {
    console.error("Error searching notes:", error);
    return { status: "error", message: "Không thể tìm kiếm ghi chú" };
  }
};

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
        message: 'Không tìm thấy bài học',
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
      message: 'Bài học đã được đánh dấu hoàn thành',
      courseCompleted: false,
      nextLessonId,
    };
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    return {
      status: 'error',
      message: 'Không thể đánh dấu bài học đã hoàn thành',
    };
  }
}