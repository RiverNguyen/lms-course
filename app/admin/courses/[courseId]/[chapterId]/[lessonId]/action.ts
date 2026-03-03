"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { LessonSchemaType, lessonSchema } from "@/lib/zod-schemas";
import { request } from "@arcjet/next";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 5,
  })
);

export const UpdateLesson = async (
  values: LessonSchemaType,
  lessonId: string
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
    const result = lessonSchema.safeParse(values);

    if (!result.success) {
      return {
        status: "error",
        message: "Dữ liệu không hợp lệ",
      };
    }

    await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        title: result.data.name,
        description: result.data.description,
        thumbnailKey: result.data.thumbnailKey,
        videoKey: result.data.videoKey,
      },
    });

    return {
      status: "success",
      message: "Bài học đã được cập nhật thành công",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
};
