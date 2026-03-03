"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { revalidatePath, revalidateTag } from "next/cache";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 10,
  })
);

export const BulkDeleteCategories = async (
  categoryIds: string[]
): Promise<ApiResponse> => {
  const session = await requireAdmin();
  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session?.user.id as string,
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "Quá nhiều yêu cầu",
        };
      } else {
        return {
          status: "error",
          message: "Không được phép",
        };
      }
    }

    if (!categoryIds || categoryIds.length === 0) {
      return {
        status: "error",
        message: "Chưa chọn danh mục nào",
      };
    }

    // Check which categories have courses
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    const categoriesWithCourses = categories.filter(
      (cat) => cat._count.courses > 0
    );
    const categoriesToDelete = categories.filter(
      (cat) => cat._count.courses === 0
    );

    if (categoriesWithCourses.length > 0) {
      const categoryNames = categoriesWithCourses.map((cat) => cat.name).join(", ");
      return {
        status: "error",
        message: `Không thể xóa ${categoriesWithCourses.length} danh mục vì có khóa học: ${categoryNames}. Vui lòng xóa hết các khóa học trong các danh mục này trước khi xóa.`,
      };
    }

    if (categoriesToDelete.length === 0) {
      return {
        status: "error",
        message: "Không có danh mục nào có thể xóa",
      };
    }

    await prisma.category.deleteMany({
      where: {
        id: {
          in: categoriesToDelete.map((cat) => cat.id),
        },
      },
    });

    revalidatePath(`/admin/categories`);
    revalidateTag("course-filters", "max");

    return {
      status: "success",
      message: `${categoriesToDelete.length} danh mục đã được xóa thành công`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
};
