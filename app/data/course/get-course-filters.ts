import { prisma } from "@/lib/prisma";

export const getCourseFilters = async () => {
  // Get categories with course counts
  const categories = await prisma.category.findMany({
    where: {
      courses: {
        some: {
          status: "Published",
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          courses: {
            where: {
              status: "Published",
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Get instructors with course counts
  const instructors = await prisma.user.findMany({
    where: {
      courses: {
        some: {
          status: "Published",
        },
      },
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          courses: {
            where: {
              status: "Published",
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Get price counts
  const [freeCount, paidCount, totalCount] = await Promise.all([
    prisma.course.count({
      where: {
        status: "Published",
        price: "0",
      },
    }),
    prisma.course.count({
      where: {
        status: "Published",
        price: { not: "0" },
      },
    }),
    prisma.course.count({
      where: {
        status: "Published",
      },
    }),
  ]);

  // Get level counts
  const levelCounts = await prisma.course.groupBy({
    by: ["level"],
    where: {
      status: "Published",
    },
    _count: {
      id: true,
    },
  });

  return {
    categories: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      count: cat._count.courses,
    })),
    instructors: instructors.map((inst) => ({
      id: inst.id,
      name: inst.name,
      count: inst._count.courses,
    })),
    prices: {
      all: totalCount,
      free: freeCount,
      paid: paidCount,
    },
    levels: levelCounts.reduce(
      (acc, item) => {
        acc[item.level] = item._count.id;
        return acc;
      },
      {} as Record<string, number>
    ),
    allLevels: totalCount,
  };
};

export type CourseFiltersType = Awaited<ReturnType<typeof getCourseFilters>>;
