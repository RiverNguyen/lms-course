import { Suspense } from "react";
import { getFeaturedCourses } from "@/app/data/course/get-featured-courses";
import PublicCourseCard, {
  PublicCourseCardSkeleton,
} from "@/app/(public)/_components/public-course-card";
import { SectionHeader } from "./section-header";
import { CoursesGridClient } from "./courses-grid-client";

async function CoursesGrid() {
  const courses = await getFeaturedCourses(5);
  return <CoursesGridClient courses={courses} />;
}

export const FeaturedCoursesSection = () => {
  return (
    <section id="courses" className="py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <SectionHeader
          title="Khóa học Nổi bật"
          description="Khám phá các khóa học phổ biến nhất, được thiết kế bởi các chuyên gia hàng đầu trong lĩnh vực của họ"
        />

        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <PublicCourseCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <CoursesGrid />
        </Suspense>
      </div>
    </section>
  );
};
