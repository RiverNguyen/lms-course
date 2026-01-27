import { getLessonContent } from "@/app/data/course/get-lesson-content";
import CourseContent from "./_components/course-content";
import CourseContentSkeleton from "./_components/course-content-skeleton";
import { Suspense } from "react";

type Params = Promise<{
  lessonId: string;
}>;

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