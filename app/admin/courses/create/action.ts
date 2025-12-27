"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { CourseLevel, CourseStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { CourseSchemaType, courseSchema } from "@/lib/zod-schemas";
import { request } from "@arcjet/next";

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    })
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    })
  );

export const CreateCourse = async (
  values: CourseSchemaType
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
    const validation = courseSchema.safeParse(values);

    if (!validation.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    await prisma.course.create({
      data: {
        ...validation.data,
        level: validation.data.level as CourseLevel,
        status: validation.data.status as CourseStatus,
        userId: session?.user.id,
      },
    });

    return {
      status: "success",
      message: "Course created successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
