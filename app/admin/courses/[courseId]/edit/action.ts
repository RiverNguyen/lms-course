"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { env } from "@/lib/env";
import { CourseLevel, CourseStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import {
  ChapterSchemaType,
  CourseSchemaType,
  LessonSchemaType,
  chapterSchema,
  courseSchema,
  lessonSchema,
} from "@/lib/zod-schemas";
import { request } from "@arcjet/next";
import { revalidatePath, revalidateTag } from "next/cache";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 5,
  })
);

export const EditCourse = async (
  data: CourseSchemaType,
  courseId: string
): Promise<ApiResponse> => {
  const session = await requireAdmin();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session?.user?.id as string,
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

    const result = courseSchema.safeParse(data);
    if (!result.success) {
      return {
        status: "error",
        message: "Dữ liệu không hợp lệ",
      };
    }

    // Get current course to check for Stripe product and status
    const currentCourse = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId: session?.user?.id as string,
      },
      select: {
        stripePriceId: true,
        status: true,
        slug: true,
      },
    });

    if (!currentCourse) {
      return {
        status: "error",
        message: "Không tìm thấy khóa học",
      };
    }

    let updatedStripePriceId = currentCourse.stripePriceId;

    // Update Stripe product if it exists
    if (currentCourse.stripePriceId) {
      try {
        // Get the price to find the product ID
        const price = await stripe.prices.retrieve(currentCourse.stripePriceId);
        const productId = typeof price.product === 'string' ? price.product : price.product.id;

        // Check if price has changed
        const newPriceAmount = Number(result.data.price);
        const priceChanged = price.unit_amount !== newPriceAmount;

        // Update the product
        await stripe.products.update(productId, {
          name: result.data.title,
          description: result.data.smallDescription,
          images: [`https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGE}.t3.storage.dev/${result.data.fileKey}`],
        });

        // If price changed, create a new price and set it as default
        if (priceChanged) {
          const newPrice = await stripe.prices.create({
            product: productId,
            currency: 'vnd',
            unit_amount: newPriceAmount,
          });

          // Set the new price as default for the product
          await stripe.products.update(productId, {
            default_price: newPrice.id,
          });

          updatedStripePriceId = newPrice.id;
        }
      } catch (error) {
        // If Stripe update fails, log but continue with database update
        console.error("Failed to update Stripe product:", error);
      }
    }

    await prisma.course.update({
      where: {
        id: courseId,
        userId: session?.user?.id as string,
      },
      data: {
        title: result.data.title,
        description: result.data.description,
        fileKey: result.data.fileKey,
        price: result.data.price,
        duration: result.data.duration,
        level: result.data.level as CourseLevel,
        status: result.data.status as CourseStatus,
        categoryId: result.data.categoryId || null,
        smallDescription: result.data.smallDescription,
        slug: result.data.slug,
        stripePriceId: updatedStripePriceId,
      },
    });

    // Thông báo "Khóa mới" khi chuyển sang Published
    const wasNotPublished =
      currentCourse.status !== "Published";
    if (wasNotPublished && result.data.status === "Published") {
      const { notifyNewCourse } = await import(
        "@/app/data/notification/notification-service"
      );
      notifyNewCourse(result.data.title, result.data.slug).catch((err) =>
        console.error("notifyNewCourse failed:", err)
      );
    }

    return {
      status: "success",
      message: "Khóa học đã được cập nhật thành công",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
};

export const ReorderLessons = async (
  chapterId: string,
  lessons: { id: string; position: number }[],
  courseId: string
): Promise<ApiResponse> => {
  await requireAdmin();
  try {
    if (!lessons || lessons.length === 0) {
      return {
        status: "error",
        message: "Bài học là bắt buộc",
      };
    }

    const updates = lessons.map((lesson) =>
      prisma.lesson.update({
        where: {
          id: lesson.id,
          chapterId: chapterId,
        },
        data: {
          position: lesson.position,
        },
      })
    );

    await prisma.$transaction(updates);

    revalidatePath(`/admin/courses/${courseId}/edit`);
    revalidateTag("courses", "max");
    revalidateTag("course-filters", "max");

    return {
      status: "success",
      message: "Bài học đã được sắp xếp lại thành công",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
};

export const ReorderChapters = async (
  courseId: string,
  chapters: { id: string; position: number }[]
): Promise<ApiResponse> => {
  await requireAdmin();
  try {
    if (!chapters || chapters.length === 0) {
      return {
        status: "error",
        message: "Chương là bắt buộc",
      };
    }

    const updates = chapters.map((chapter) =>
      prisma.chapter.update({
        where: {
          id: chapter.id,
          courseId: courseId,
        },
        data: {
          position: chapter.position,
        },
      })
    );

    await prisma.$transaction(updates);

    revalidatePath(`/admin/courses/${courseId}/edit`);
    revalidateTag("courses", "max");
    revalidateTag("course-filters", "max");

    return {
      status: "success",
      message: "Chapters reordered successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
};

export const CreateChapter = async (
  value: ChapterSchemaType
): Promise<ApiResponse> => {
  await requireAdmin();
  try {
    const result = chapterSchema.safeParse(value);
    if (!result.success) {
      return {
        status: "error",
        message: "Dữ liệu không hợp lệ",
      };
    }

    await prisma.$transaction(async (tx) => {
      const maxPos = await tx.chapter.findFirst({
        where: {
          courseId: result.data.courseId,
        },
        select: {
          position: true,
        },
        orderBy: {
          position: "desc",
        },
      });

      await tx.chapter.create({
        data: {
          title: result.data.name,
          courseId: result.data.courseId,
          position: (maxPos?.position ?? 0) + 1,
        },
      });
    });

    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);
    revalidateTag("courses", "max");
    revalidateTag("course-filters", "max");

    return {
      status: "success",
      message: "Chapter created successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const CreateLesson = async (
  value: LessonSchemaType
): Promise<ApiResponse> => {
  await requireAdmin();
  try {
    const result = lessonSchema.safeParse(value);
    if (!result.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    await prisma.$transaction(async (tx) => {
      const maxPos = await tx.lesson.findFirst({
        where: {
          chapterId: result.data.chapterId,
        },
        select: {
          position: true,
        },
        orderBy: {
          position: "desc",
        },
      });

      await tx.lesson.create({
        data: {
          title: result.data.name,
          position: (maxPos?.position ?? 0) + 1,
          description: result.data.description,
          thumbnailKey: result.data.thumbnailKey,
          videoKey: result.data.videoKey,
          chapterId: result.data.chapterId,
        },
      });
    });

    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);
    revalidateTag("courses", "max");
    revalidateTag("course-filters", "max");

    return {
      status: "success",
      message: "Bài học đã được tạo thành công",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
};

export const RemoveLesson = async (
  chapterId: string,
  courseId: string,
  lessonId: string
): Promise<ApiResponse> => {
  await requireAdmin();
  try {
    const chapterWithLessons = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
      select: {
        lessons: {
          orderBy: {
            position: "asc",
          },
          select: {
            id: true,
            position: true,
          },
        },
      },
    });

    if (!chapterWithLessons) {
      return {
        status: "error",
        message: "Không tìm thấy chương",
      };
    }

    const lessons = chapterWithLessons.lessons;

    const lessonToDelete = lessons.find((lesson) => lesson.id === lessonId);

    if (!lessonToDelete) {
      return {
        status: "error",
        message: "Không tìm thấy bài học",
      };
    }

    const remainingLessons = lessons.filter((lesson) => lesson.id !== lessonId);

    const updates = remainingLessons.map((lesson, index) => {
      return prisma.lesson.update({
        where: {
          id: lesson.id,
        },
        data: {
          position: index + 1,
        },
      });
    });

    await prisma.$transaction([
      ...updates,
      prisma.lesson.delete({
        where: {
          id: lessonId,
          chapterId: chapterId,
        },
      }),
    ]);

    revalidatePath(`/admin/courses/${courseId}/edit`);
    revalidateTag("courses", "max");
    revalidateTag("course-filters", "max");

    return {
      status: "success",
      message: "Bài học đã được xóa thành công",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
};

export const RemoveChapter = async (
  chapterId: string,
  courseId: string
): Promise<ApiResponse> => {
  await requireAdmin();
  try {
    const courseWithChapters = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        chapters: {
          orderBy: {
            position: "asc",
          },
          select: {
            id: true,
            position: true,
          },
        },
      },
    });

    if (!courseWithChapters) {
      return {
        status: "error",
        message: "Không tìm thấy khóa học",
      };
    }

    const chapters = courseWithChapters.chapters;

    const chapterToDelete = chapters.find(
      (chapter) => chapter.id === chapterId
    );

    if (!chapterToDelete) {
      return {
        status: "error",
        message: "Không tìm thấy chương",
      };
    }

    const remainingChapters = chapters.filter(
      (chapter) => chapter.id !== chapterId
    );

    const updates = remainingChapters.map((chapter, index) => {
      return prisma.chapter.update({
        where: {
          id: chapter.id,
        },
        data: {
          position: index + 1,
        },
      });
    });

    await prisma.$transaction([
      ...updates,
      prisma.chapter.delete({
        where: {
          id: chapterId,
        },
      }),
    ]);

    revalidatePath(`/admin/courses/${courseId}/edit`);
    revalidateTag("courses", "max");
    revalidateTag("course-filters", "max");

    return {
      status: "success",
      message: "Chương đã được xóa thành công",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
};

export const CreateCourseStructureFromAI = async (
  courseId: string,
  structure: {
    chapters: Array<{ name: string; lessons: Array<{ name: string }> }>;
  }
): Promise<ApiResponse> => {
  const session = await requireAdmin();

  try {
    // Verify course exists and belongs to admin
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId: session?.user?.id as string,
      },
    });

    if (!course) {
      return {
        status: "error",
        message: "Không tìm thấy khóa học",
      };
    }

    if (!structure.chapters || structure.chapters.length === 0) {
      return {
        status: "error",
        message: "Cấu trúc không hợp lệ: cần ít nhất 1 chương",
      };
    }

    await prisma.$transaction(async (tx) => {
      // Get current max chapter position
      const maxChapterPos = await tx.chapter.findFirst({
        where: { courseId },
        select: { position: true },
        orderBy: { position: "desc" },
      });
      let currentChapterPosition = (maxChapterPos?.position ?? 0) + 1;

      // Create chapters and lessons
      for (const chapterData of structure.chapters) {
        // Create chapter
        const chapter = await tx.chapter.create({
          data: {
            title: chapterData.name,
            courseId,
            position: currentChapterPosition++,
          },
        });

        // Get current max lesson position for this chapter
        const maxLessonPos = await tx.lesson.findFirst({
          where: { chapterId: chapter.id },
          select: { position: true },
          orderBy: { position: "desc" },
        });
        let currentLessonPosition = (maxLessonPos?.position ?? 0) + 1;

        // Create lessons for this chapter
        for (const lessonData of chapterData.lessons) {
          await tx.lesson.create({
            data: {
              title: lessonData.name,
              chapterId: chapter.id,
              position: currentLessonPosition++,
            },
          });
        }
      }
    });

    revalidatePath(`/admin/courses/${courseId}/edit`);
    revalidateTag("courses", "max");
    revalidateTag("course-filters", "max");

    return {
      status: "success",
      message: `Đã tạo ${structure.chapters.length} chương và ${structure.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)} bài học thành công`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
};
