import { getLessonContent } from "@/app/data/course/get-lesson-content";
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
  const { lessonId } = await params;

  return (
    <Suspense fallback={<CourseContentSkeleton />}>
      <LessonPageLoader lessonId={lessonId} />
    </Suspense>
  )
}

async function LessonPageLoader({ lessonId }: { lessonId: string }) {
  const lesson = await getLessonContent(lessonId);

  return (
    <CourseContent data={lesson} />
  )

}