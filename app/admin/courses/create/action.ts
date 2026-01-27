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

    const data = await stripe.products.create({
      name: validation.data.title,
      description: validation.data.smallDescription,
      default_price_data: {
        currency: 'usd',
        unit_amount: Number(validation.data.price) * 100,
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
