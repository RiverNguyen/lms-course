import { getCourseSidebarData } from "@/app/data/course/get-course-sidebar-data";
import Link from "next/link";
import { redirect } from "next/navigation";

interface CourseSlugRouteProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseSlugRoute({ params }: CourseSlugRouteProps) {
  const { slug } = await params;
  const { course } = await getCourseSidebarData(slug);

  const firstChapter = course.chapters[0];
  const firstLesson = firstChapter.lessons[0];

  if (firstLesson) {
    return redirect(`/dashboard/${slug}/${firstLesson.id}`);
  }

  return (
    <div className="flex items-center justify-center h-full text-center">
      <h2 className="text-2xl font-bold mb-2">No lessons available!</h2>
      <p className="text-muted-foreground">This course has no lessons yet. Please check back later.</p>
      <Link href={`/dashboard/${slug}`} className="mt-4 text-primary hover:underline">Go back to course</Link>
    </div>
  )
}