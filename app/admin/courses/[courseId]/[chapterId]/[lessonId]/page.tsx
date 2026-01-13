import { adminGetLesson } from "@/app/data/admin/admin-get-lesson";
import LessonForm from "@/app/admin/courses/[courseId]/[chapterId]/[lessonId]/_components/lesson-form";

type Params = Promise<{
  courseId: string;
  chapterId: string;
  lessonId: string;
}>;

export default async function LessonPage({ params }: { params: Params }) {
  const { courseId, chapterId, lessonId } = await params;
  const lesson = await adminGetLesson(lessonId);

  return <LessonForm data={lesson} chapterId={chapterId} courseId={courseId} />;
}
