import CourseSidebar from "@/app/dashboard/_components/course-sidebar";
import CourseSidebarSkeleton from "@/app/dashboard/_components/course-sidebar-skeleton";
import { getCourseSidebarData } from "@/app/data/course/get-course-sidebar-data";
import { Suspense } from "react";

interface CourseSlugLayoutProps {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export default async function CourseSlugLayout({ params, children }: CourseSlugLayoutProps) {
  const { slug } = await params;
  
  return (
    <div className="flex flex-1">
      <div className="w-80 border-r border-border shrink-0">
        <Suspense fallback={<CourseSidebarSkeleton />}>
          <CourseSidebarLoader slug={slug} />
        </Suspense>
      </div>

      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}

async function CourseSidebarLoader({ slug }: { slug: string }) {
  const { course } = await getCourseSidebarData(slug);
  return <CourseSidebar course={course} />;
}