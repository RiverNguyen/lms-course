"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

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
          message: "Too many requests",
        };
      } else {
        return {
          status: "error",
          message: "Unauthorized",
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
        message: "Category not found",
      };
    }

    // Delete the category (courses will have categoryId set to null due to onDelete: SetNull)
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    revalidatePath(`/admin/categories`);

    return {
      status: "success",
      message: "Category deleted successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
