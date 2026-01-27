import { adminGetUserSignupsData } from "@/app/data/admin/admin-get-chart-data"
import { adminGetEnrollmentsData } from "@/app/data/admin/admin-get-chart-data"
import { adminGetRevenueData } from "@/app/data/admin/admin-get-chart-data"
import { adminGetCourseStatusData } from "@/app/data/admin/admin-get-chart-data"
import { adminGetCourseLevelData } from "@/app/data/admin/admin-get-chart-data"
import { adminGetEnrollmentStatusData } from "@/app/data/admin/admin-get-chart-data"
import { adminGetCoursesByCategoryData } from "@/app/data/admin/admin-get-chart-data"
import { ChartUserSignups } from "./chart-user-signups"
import { ChartEnrollments } from "./chart-enrollments"
import { ChartRevenue } from "./chart-revenue"
import { ChartCourseStatus } from "./chart-course-status"
import { ChartCourseLevel } from "./chart-course-level"
import { ChartEnrollmentStatus } from "./chart-enrollment-status"
import { ChartCoursesByCategory } from "./chart-courses-by-category"

export async function ChartsWrapper() {
  const [
    userSignupsData,
    enrollmentsData,
    revenueData,
    courseStatusData,
    courseLevelData,
    enrollmentStatusData,
    coursesByCategoryData,
  ] = await Promise.all([
    adminGetUserSignupsData("90d"),
    adminGetEnrollmentsData("90d"),
    adminGetRevenueData("90d"),
    adminGetCourseStatusData(),
    adminGetCourseLevelData(),
    adminGetEnrollmentStatusData(),
    adminGetCoursesByCategoryData(),
  ])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="md:col-span-2 lg:col-span-3">
        <ChartUserSignups initialData={userSignupsData} />
      </div>
      <div className="md:col-span-2 lg:col-span-3">
        <ChartEnrollments initialData={enrollmentsData} />
      </div>
      <div className="md:col-span-2 lg:col-span-3">
        <ChartRevenue initialData={revenueData} />
      </div>
      <ChartCourseStatus data={courseStatusData} />
      <ChartCourseLevel data={courseLevelData} />
      <ChartEnrollmentStatus data={enrollmentStatusData} />
      <div className="md:col-span-2 lg:col-span-3">
        <ChartCoursesByCategory data={coursesByCategoryData} />
      </div>
    </div>
  )
}
