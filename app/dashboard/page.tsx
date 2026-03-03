import { getAllCourses } from "@/app/data/course/get-all-courses"
import { getEnrolledCourse } from '@/app/data/user/get-enrolled-course'
import EmptyState from "@/components/general/empty-state"
import PublicCourseCard from "@/app/(public)/_components/public-course-card"
import CourseProgressCard from "./_components/course-progress-card"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng điều khiển",
  description: "Quản lý các khóa học đã đăng ký và khám phá cơ hội học tập mới. Theo dõi tiến độ và tiếp tục hành trình học tập của bạn.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Bảng điều khiển - TunaLMS",
    description: "Quản lý các khóa học đã đăng ký và khám phá cơ hội học tập mới.",
    url: "/dashboard",
  },
};

export default async function DashboardPage() {
  const [allCourses, enrolledCourses] = await Promise.all([getAllCourses(), getEnrolledCourse()])

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Khóa học Đã đăng ký</h1>
        <p className="text-muted-foreground">Bạn có {enrolledCourses.length} khóa học đã đăng ký</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <EmptyState
          title="Chưa có khóa học nào"
          description="Bạn chưa đăng ký khóa học nào"
          buttonText="Đăng ký khóa học"
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
          <h2 className="text-2xl font-bold">Khóa học Có sẵn</h2>
          <p className="text-muted-foreground">Khám phá nhiều khóa học đa dạng về nhiều chủ đề.</p>
        </div>

        {allCourses.filter((course) => !enrolledCourses.some(({ course: enrolled }) => enrolled.id === course.id)).length === 0 ? (
          <EmptyState
            title="Không có khóa học nào"
            description="Hiện tại không có khóa học nào"
            buttonText="Xem tất cả khóa học"
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