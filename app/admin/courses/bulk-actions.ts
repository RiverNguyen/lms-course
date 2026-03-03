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

export const BulkDeleteCourses = async (
  courseIds: string[]
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

    if (!courseIds || courseIds.length === 0) {
      return {
        status: "error",
        message: "Chưa chọn khóa học nào",
      };
    }

    await prisma.course.deleteMany({
      where: {
        id: {
          in: courseIds,
        },
      },
    });

    revalidatePath(`/admin/courses`);

    return {
      status: "success",
      message: `${courseIds.length} khóa học đã được xóa thành công`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
};

export const BulkUpdateCourseStatus = async (
  courseIds: string[],
  status: "Draft" | "Published" | "Archived"
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

    if (!courseIds || courseIds.length === 0) {
      return {
        status: "error",
        message: "Chưa chọn khóa học nào",
      };
    }

    await prisma.course.updateMany({
      where: {
        id: {
          in: courseIds,
        },
      },
      data: {
        status,
      },
    });

    revalidatePath(`/admin/courses`);
    revalidateTag("courses", "max");
    revalidateTag("course-filters", "max");

    return {
      status: "success",
      message: `${courseIds.length} khóa học đã được cập nhật thành công`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
};
