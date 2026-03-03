import "server-only";
import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/prisma";

/**
 * Search in notes for a course (all lessons the user has notes in).
 * Returns notes matching the query with lesson title for context.
 */
export async function searchLessonNotes(courseId: string, query: string) {
  const session = await requireUser();

  if (!query.trim()) {
    return [];
  }

  const notes = await prisma.lessonNote.findMany({
    where: {
      userId: session.id,
      lesson: {
        chapter: {
          courseId,
        },
      },
      content: {
        contains: query.trim(),
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      content: true,
      updatedAt: true,
      lesson: {
        select: {
          id: true,
          title: true,
          chapter: {
            select: {
              title: true,
              course: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 50,
  });

  return notes;
}

export type SearchLessonNoteItem = Awaited<ReturnType<typeof searchLessonNotes>>[number];
