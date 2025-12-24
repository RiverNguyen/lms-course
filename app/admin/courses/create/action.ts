"use server";

import { auth } from "@/lib/auth";
import { CourseLevel, CourseStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/zod-schemas";
import { headers } from "next/headers";

export const CreateCourse = async (
  values: CourseSchemaType
): Promise<ApiResponse> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

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
