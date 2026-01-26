import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/prisma";

export const adminGetDashboardStats = async () => {
  await requireAdmin();

  const [totalSignups, totalCustomers, totalCourses, totalLessons] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        enrollments: {
          some: {

          },
        },
      },
    }),
    prisma.course.count(),
    prisma.lesson.count(),
  ])

  return {
    totalSignups,
    totalCustomers,
    totalCourses,
    totalLessons,
  }
}