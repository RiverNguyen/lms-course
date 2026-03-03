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

export const DeleteReview = async (reviewId: string): Promise<ApiResponse> => {
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
          message: "Bạn là bot!",
        };
      }
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return {
        status: "error",
        message: "Đánh giá không tồn tại",
      };
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    revalidatePath("/admin/reviews");

    return {
      status: "success",
      message: "Đánh giá đã được xóa thành công",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
};
