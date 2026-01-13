import PublicCourseCard, {
  PublicCourseCardSkeleton,
} from "@/app/(public)/_components/public-course-card";
import { getAllCourses } from "@/app/data/course/get-all-courses";
import { Suspense } from "react";

const CoursesPage = () => {
  return (
    <div>
      <div className="flex flex-col space-y-2 mb-10 mt-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
          Explore Courses
        </h1>
        <p className="text-muted-foreground">
          Discover a wide range of courses on a variety of topics.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PublicCourseCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <RenderCourses />
      </Suspense>
    </div>
  );
};

async function RenderCourses() {
  const courses = await getAllCourses();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 gap-6">
      {courses?.map((course) => (
        <PublicCourseCard key={course.id} data={course} />
      ))}
    </div>
  );
}

export default CoursesPage;
