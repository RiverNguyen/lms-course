"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { CategorySchemaType, categorySchema } from "@/lib/zod-schemas";
import { request } from "@arcjet/next";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 5,
  })
);

export const CreateCategory = async (
  values: CategorySchemaType
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
          message: "You are a bot!",
        };
      }
    }
    const validation = categorySchema.safeParse(values);

    if (!validation.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: {
        slug: validation.data.slug,
      },
    });

    if (existingCategory) {
      return {
        status: "error",
        message: "A category with this slug already exists",
      };
    }

    await prisma.category.create({
      data: {
        ...validation.data,
      },
    });

    return {
      status: "success",
      message: "Category created successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
