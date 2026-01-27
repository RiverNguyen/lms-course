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
          message: "Too many requests",
        };
      } else {
        return {
          status: "error",
          message: "Unauthorized",
        };
      }
    }

    if (!categoryIds || categoryIds.length === 0) {
      return {
        status: "error",
        message: "No categories selected",
      };
    }

    await prisma.category.deleteMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
    });

    revalidatePath(`/admin/categories`);

    return {
      status: "success",
      message: `${categoryIds.length} categor${categoryIds.length === 1 ? "y" : "ies"} deleted successfully`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
