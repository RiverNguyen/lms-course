import "server-only";
import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/prisma";

export async function getLessonBookmarks(lessonId: string) {
  const session = await requireUser();

  const bookmarks = await prisma.lessonBookmark.findMany({
    where: {
      lessonId,
      userId: session.id,
    },
    orderBy: {
      timestamp: "asc",
    },
  });

  return bookmarks;
}

export type LessonBookmarkType = Awaited<ReturnType<typeof getLessonBookmarks>>[number];
