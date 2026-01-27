import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/prisma";

type TimeRange = "7d" | "30d" | "90d" | "1y";

function getDateRange(timeRange: TimeRange) {
  const now = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(now.getDate() - 90);
      break;
    case "1y":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return { startDate, endDate: now };
}

// User signups over time
export const adminGetUserSignupsData = async (timeRange: TimeRange = "90d") => {
  await requireAdmin();
  
  const { startDate, endDate } = getDateRange(timeRange);
  
  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  
  // Group by date
  const grouped = users.reduce((acc, user) => {
    const date = user.createdAt.toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Fill in missing dates
  const result = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      signups: grouped[dateStr] || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
};

// Enrollments over time
export const adminGetEnrollmentsData = async (timeRange: TimeRange = "90d") => {
  await requireAdmin();
  
  const { startDate, endDate } = getDateRange(timeRange);
  
  const enrollments = await prisma.enrollment.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
      status: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  
  // Group by date and status
  const grouped = enrollments.reduce((acc, enrollment) => {
    const date = enrollment.createdAt.toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = { total: 0, active: 0, completed: 0 };
    }
    acc[date].total += 1;
    if (enrollment.status === "Active") acc[date].active += 1;
    if (enrollment.status === "Completed") acc[date].completed += 1;
    return acc;
  }, {} as Record<string, { total: number; active: number; completed: number }>);
  
  // Fill in missing dates
  const result = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const data = grouped[dateStr] || { total: 0, active: 0, completed: 0 };
    result.push({
      date: dateStr,
      total: data.total,
      active: data.active,
      completed: data.completed,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
};

// Revenue over time
export const adminGetRevenueData = async (timeRange: TimeRange = "90d") => {
  await requireAdmin();
  
  const { startDate, endDate } = getDateRange(timeRange);
  
  const enrollments = await prisma.enrollment.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ["Active", "Completed"],
      },
    },
    select: {
      createdAt: true,
      amount: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  
  // Group by date
  const grouped = enrollments.reduce((acc, enrollment) => {
    const date = enrollment.createdAt.toISOString().split("T")[0];
    const amount = parseFloat(enrollment.amount) || 0;
    acc[date] = (acc[date] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Fill in missing dates
  const result = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      revenue: grouped[dateStr] || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
};

// Course status distribution
export const adminGetCourseStatusData = async () => {
  await requireAdmin();
  
  const courses = await prisma.course.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });
  
  return courses.map((item) => ({
    status: item.status,
    count: item._count.id,
  }));
};

// Course level distribution
export const adminGetCourseLevelData = async () => {
  await requireAdmin();
  
  const courses = await prisma.course.groupBy({
    by: ["level"],
    _count: {
      id: true,
    },
  });
  
  return courses.map((item) => ({
    level: item.level,
    count: item._count.id,
  }));
};

// Enrollment status distribution
export const adminGetEnrollmentStatusData = async () => {
  await requireAdmin();
  
  const enrollments = await prisma.enrollment.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });
  
  return enrollments.map((item) => ({
    status: item.status,
    count: item._count.id,
  }));
};

// Courses by category
export const adminGetCoursesByCategoryData = async () => {
  await requireAdmin();
  
  const courses = await prisma.course.findMany({
    where: {
      categoryId: {
        not: null,
      },
    },
    include: {
      category: true,
    },
  });
  
  const grouped = courses.reduce((acc, course) => {
    const categoryName = course.category?.name || "Uncategorized";
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(grouped).map(([category, count]) => ({
    category,
    count,
  }));
};
