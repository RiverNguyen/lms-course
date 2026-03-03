import "server-only";
import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/prisma";

export async function getLessonNote(lessonId: string) {
  const session = await requireUser();

  const note = await prisma.lessonNote.findUnique({
    where: {
      userId_lessonId: {
        userId: session.id,
        lessonId,
      },
    },
  });

  return note;
}

export type LessonNoteType = Awaited<ReturnType<typeof getLessonNote>>;
