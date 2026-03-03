import { getLessonContent } from "@/app/data/course/get-lesson-content";
import { getLessonNote } from "@/app/data/course/get-lesson-notes";
import { getLessonBookmarks } from "@/app/data/course/get-lesson-bookmarks";
import CourseContent from "./_components/course-content";
import CourseContentSkeleton from "./_components/course-content-skeleton";
import { Suspense } from "react";
import type { Metadata } from "next";

type Params = Promise<{
  lessonId: string;
  slug: string;
}>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lessonId } = await params;

  try {
    const lesson = await getLessonContent(lessonId);

    return {
      title: lesson.title,
      description: lesson.description || `Learn ${lesson.title} in this comprehensive lesson.`,
      robots: {
        index: false,
        follow: false,
      },
    };
  } catch {
    return {
      title: "Lesson",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function LessonPage({ params }: { params: Params }) {
  const { lessonId, slug } = await params;

  return (
    <Suspense fallback={<CourseContentSkeleton />}>
      <LessonPageLoader lessonId={lessonId} slug={slug} />
    </Suspense>
  )
}

async function LessonPageLoader({ lessonId, slug }: { lessonId: string; slug: string }) {
  const [lesson, initialNote, initialBookmarks] = await Promise.all([
    getLessonContent(lessonId),
    getLessonNote(lessonId),
    getLessonBookmarks(lessonId),
  ]);

  return (
    <CourseContent
      data={lesson}
      slug={slug}
      initialNote={initialNote}
      initialBookmarks={initialBookmarks}
    />
  )
}