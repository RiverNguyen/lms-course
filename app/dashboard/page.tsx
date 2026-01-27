import { getAllCourses } from "@/app/data/course/get-all-courses"
import { getEnrolledCourse } from '@/app/data/user/get-enrolled-course'
import EmptyState from "@/components/general/empty-state"
import PublicCourseCard from "@/app/(public)/_components/public-course-card"
import CourseProgressCard from "./_components/course-progress-card"

export default async function DashboardPage() {
  const [allCourses, enrolledCourses] = await Promise.all([getAllCourses(), getEnrolledCourse()])

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Enrolled Courses</h1>
        <p className="text-muted-foreground">You have {enrolledCourses.length} enrolled courses</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <EmptyState
          title="No enrolled courses"
          description="You have not enrolled in any courses"
          buttonText="Enroll in a course"
          href="/courses"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 gap-6">
          {enrolledCourses.map(({ course }) => (
            <CourseProgressCard key={course.id} data={{ course }} />
          ))}
        </div>
      )}

      <section className="mt-10">
        <div className="flex flex-col gap-2 mb-5">
          <h2 className="text-2xl font-bold">Available Courses</h2>
          <p className="text-muted-foreground">Discover a wide range of courses on a variety of topics.</p>
        </div>

        {allCourses.filter((course) => !enrolledCourses.some(({ course: enrolled }) => enrolled.id === course.id)).length === 0 ? (
          <EmptyState
            title="No available courses"
            description="No courses are available at the moment"
            buttonText="View all courses"
            href="/courses"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 gap-6">
            {allCourses.filter((course) => !enrolledCourses.some(({ course: enrolled }) => enrolled.id === course.id)).map((course) => (
              <PublicCourseCard key={course.id} data={course} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}