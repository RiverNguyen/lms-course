import { adminGetDashboardStats } from "@/app/data/admin/admin-get-dashboard-stats"
import { SectionCardsClient } from "./section-cards-client"

export async function SectionCards() {
  const { totalSignups, totalCustomers, totalCourses, totalLessons } = await adminGetDashboardStats()

  const cards = [
    {
      title: "Total Signups",
      value: totalSignups,
      description: "Register users on the platform",
      icon: "IconUserPlus",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      delay: 0,
    },
    {
      title: "Total Customers",
      value: totalCustomers,
      description: "Total users have enrolled in a course",
      icon: "IconUsers",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      delay: 0.1,
    },
    {
      title: "Total Courses",
      value: totalCourses,
      description: "Total courses created by the platform",
      icon: "IconSchool",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      delay: 0.2,
    },
    {
      title: "Total Lessons",
      value: totalLessons,
      description: "Total lessons created by the platform",
      icon: "IconBook",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      delay: 0.3,
    },
  ]

  return <SectionCardsClient cards={cards} />
}
