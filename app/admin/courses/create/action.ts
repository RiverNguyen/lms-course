"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { env } from "@/lib/env";
import { CourseLevel, CourseStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import { CourseSchemaType, courseSchema } from "@/lib/zod-schemas";
import { request } from "@arcjet/next";

const aj = arcjet.withRule(
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
          message: "Quá nhiều yêu cầu",
        };
      } else {
        return {
          status: "error",
          message: "Bạn là bot!",
        };
      }
    }
    const validation = courseSchema.safeParse(values);

    if (!validation.success) {
      return {
        status: "error",
        message: "Dữ liệu không hợp lệ",
      };
    }

    const data = await stripe.products.create({
      name: validation.data.title,
      description: validation.data.smallDescription,
      default_price_data: {
        currency: 'vnd',
        unit_amount: Number(validation.data.price),
      },
      images: [`https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGE}.t3.storage.dev/${validation.data.fileKey}`],
    })

    await prisma.course.create({
      data: {
        title: validation.data.title,
        description: validation.data.description,
        fileKey: validation.data.fileKey,
        price: validation.data.price,
        duration: validation.data.duration,
        level: validation.data.level as CourseLevel,
        status: validation.data.status as CourseStatus,
        categoryId: validation.data.categoryId || null,
        smallDescription: validation.data.smallDescription,
        slug: validation.data.slug,
        userId: session?.user.id,
        stripePriceId: data.default_price as string,
      },
    });

    // Thông báo "Khóa mới" khi tạo khóa với trạng thái Published
    if (validation.data.status === "Published") {
      const { notifyNewCourse } = await import(
        "@/app/data/notification/notification-service"
      );
      notifyNewCourse(validation.data.title, validation.data.slug).catch(
        (err) => console.error("notifyNewCourse failed:", err)
      );
    }

    return {
      status: "success",
      message: "Khóa học đã được tạo thành công",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
};
