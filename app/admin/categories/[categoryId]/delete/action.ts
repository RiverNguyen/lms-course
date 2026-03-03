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
    max: 5,
  })
);

export const DeleteCategory = async (
  categoryId: string
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

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    if (!category) {
      return {
        status: "error",
        message: "Không tìm thấy danh mục",
      };
    }

    // Check if category has courses
    if (category._count.courses > 0) {
      return {
        status: "error",
        message: `Không thể xóa danh mục này vì có ${category._count.courses} khóa học. Vui lòng xóa hết các khóa học trong danh mục trước khi xóa danh mục.`,
      };
    }

    // Delete the category
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    revalidatePath(`/admin/categories`);
    revalidateTag("course-filters", "max");

    return {
      status: "success",
      message: "Danh mục đã được xóa thành công",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
};
