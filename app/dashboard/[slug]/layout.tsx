import CourseSidebar from "@/app/dashboard/_components/course-sidebar";
import { getCourseSidebarData } from "@/app/data/course/get-course-sidebar-data";

interface CourseSlugLayoutProps {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export default async function CourseSlugLayout({ params, children }: CourseSlugLayoutProps) {
  const { slug } = await params;
  const { course } = await getCourseSidebarData(slug);
  return (
    <div className="flex flex-1">
      <div className="w-80 border-r border-border shrink-0">
        <CourseSidebar course={course} />
      </div>

      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}