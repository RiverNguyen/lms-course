import { adminGetDashboardStats } from "@/app/data/admin/admin-get-dashboard-stats"
import { SectionCardsClient } from "./section-cards-client"

export async function SectionCards() {
  const { totalSignups, totalCustomers, totalCourses, totalLessons } = await adminGetDashboardStats()

  const cards = [
    {
      title: "Tổng đăng ký",
      value: totalSignups,
      description: "Người dùng đã đăng ký trên nền tảng",
      icon: "IconUserPlus",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      delay: 0,
    },
    {
      title: "Tổng học viên",
      value: totalCustomers,
      description: "Tổng người dùng đã đăng ký khóa học",
      icon: "IconUsers",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      delay: 0.1,
    },
    {
      title: "Tổng khóa học",
      value: totalCourses,
      description: "Tổng khóa học đã tạo trên nền tảng",
      icon: "IconSchool",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      delay: 0.2,
    },
    {
      title: "Tổng bài học",
      value: totalLessons,
      description: "Tổng bài học đã tạo trên nền tảng",
      icon: "IconBook",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      delay: 0.3,
    },
  ]

  return <SectionCardsClient cards={cards} />
}
