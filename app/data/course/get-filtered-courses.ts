import { prisma } from "@/lib/prisma";

interface FilterParams {
  search?: string;
  categories?: string[];
  levels?: string[];
  price?: "all" | "free" | "paid";
  page?: number;
  pageSize?: number;
}

export const getFilteredCourses = async (params: FilterParams = {}) => {
  const {
    search = "",
    categories = [],
    levels = [],
    price = "all",
    page = 1,
    pageSize = 6,
  } = params;

  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: any = {
    status: "Published",
  };

  // Search filter
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { smallDescription: { contains: search, mode: "insensitive" } },
      { category: { name: { contains: search, mode: "insensitive" } } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Category filter
  if (categories.length > 0) {
    where.categoryId = { in: categories };
  }

  // Level filter
  if (levels.length > 0) {
    where.level = { in: levels };
  }

  // Price filter
  if (price === "free") {
    where.price = "0";
  } else if (price === "paid") {
    where.price = { not: "0" };
  }

  // Get courses with counts
  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        price: true,
        smallDescription: true,
        slug: true,
        fileKey: true,
        level: true,
        duration: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        chapters: {
          select: {
            lessons: {
              select: {
                id: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

export type FilteredCourseType = Awaited<
  ReturnType<typeof getFilteredCourses>
>["courses"][number];
