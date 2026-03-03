"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { CategorySchemaType, categorySchema } from "@/lib/zod-schemas";
import { request } from "@arcjet/next";
import { revalidatePath, revalidateTag } from "next/cache";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 5,
  })
);

export const EditCategory = async (
  data: CategorySchemaType,
  categoryId: string
): Promise<ApiResponse> => {
  const session = await requireAdmin();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session?.user?.id as string,
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
          message: "Bạn là bot!",
        };
      }
    }

    const result = categorySchema.safeParse(data);
    if (!result.success) {
      return {
        status: "error",
        message: "Dữ liệu không hợp lệ",
      };
    }

    // Check if slug already exists for another category
    const existingCategory = await prisma.category.findUnique({
      where: {
        slug: result.data.slug,
      },
    });

    if (existingCategory && existingCategory.id !== categoryId) {
      return {
        status: "error",
        message: "Một danh mục với slug này đã tồn tại",
      };
    }

    await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        ...result.data,
      },
    });

    revalidatePath(`/admin/categories`);
    revalidatePath(`/admin/categories/${categoryId}/edit`);
    revalidateTag("course-filters", "max");

    return {
      status: "success",
      message: "Danh mục đã được cập nhật thành công",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
};
