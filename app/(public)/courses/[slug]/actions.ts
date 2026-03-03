'use server'

import { requireUser } from "@/app/data/user/require-user";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const aj = arcjet.withRule(
  fixedWindow({
    mode: 'LIVE',
    window: '1m',
    max: 5,
  })
)

export const enrollInCourseAction = async (courseId: string): Promise<ApiResponse | never> => {
  let checkoutUrl: string = '';

  const user = await requireUser();

  try {
    const req = await request();

    const desision = await aj.protect(req, {
      fingerprint: user.id,
    })

    if (desision.isDenied()) {
      return {
        status: 'error',
        message: 'Bạn là bot!'
      }
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId
      },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
        stripePriceId: true
      }
    })

    if (!course) {
      return {
        status: 'error',
        message: 'Không tìm thấy khóa học'
      }
    }

    if (!course.stripePriceId) {
      return {
        status: 'error',
        message: 'Giá khóa học chưa được cấu hình. Vui lòng liên hệ hỗ trợ.'
      }
    }

    const stripePriceId: string = course.stripePriceId;
    let stripeCustomerId: string;

    const userWithStripeCustomerId = await prisma.user.findUnique({
      where: {
        id: user.id
      },
      select: {
        stripeCustomerId: true
      }
    })

    if (userWithStripeCustomerId?.stripeCustomerId) {
      stripeCustomerId = userWithStripeCustomerId?.stripeCustomerId ?? '';
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id
        }
      })

      stripeCustomerId = customer.id

      await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          stripeCustomerId: stripeCustomerId
        }
      })
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: courseId
          }
        },
        select: {
          status: true,
          id: true
        }
      })

      if (existingEnrollment?.status === 'Active' || existingEnrollment?.status === 'Completed') {
        return {
          status: 'success',
          message: 'Bạn đã đăng ký khóa học này rồi'
        }
      }

      let enrollment;

      if (existingEnrollment) {
        enrollment = await tx.enrollment.update({
          where: {
            id: existingEnrollment.id
          },
          data: {
            amount: course.price,
            status: 'Pending',
            updatedAt: new Date()
          }
        })
      } else {
        enrollment = await tx.enrollment.create({
          data: {
            userId: user.id,
            courseId: courseId,
            amount: course.price,
            status: 'Pending',
          }
        })
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          }
        ],
        mode: 'payment',
        success_url: `${env.BETTER_AUTH_URL}/payment/success?course=${course.slug}`,
        cancel_url: `${env.BETTER_AUTH_URL}/payment/cancel`,
        metadata: {
          userId: user.id,
          courseId: course.id,
          courseSlug: course.slug,
          enrollmentId: enrollment.id
        }
      })

      return {
        enrollment: enrollment,
        checkoutUrl: checkoutSession.url
      }
    })

    checkoutUrl = result.checkoutUrl as string;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return {
        status: 'error',
        message: 'Payment system error. Please try again later.'
      }
    }

    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Lỗi không xác định'
    }
  }

  redirect(checkoutUrl);
}

export const createReviewAction = async (
  courseId: string,
  rating: number,
  comment?: string
): Promise<ApiResponse> => {
  try {
    const user = await requireUser();

    // Check if user has enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
      select: {
        status: true,
      },
    });

    if (!enrollment || (enrollment.status !== 'Active' && enrollment.status !== 'Completed')) {
      return {
        status: 'error',
        message: 'Bạn phải đăng ký khóa học này trước khi để lại đánh giá'
      };
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return {
        status: 'error',
        message: 'Đánh giá phải từ 1 đến 5 sao'
      };
    }

    // Check if user already has a review for this course
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
    });

    if (existingReview) {
      return {
        status: 'error',
        message: 'Bạn đã đánh giá khóa học này rồi. Bạn có thể cập nhật đánh giá hiện có của mình.'
      };
    }

    // Create review
    await prisma.review.create({
      data: {
        rating,
        comment: comment || null,
        courseId,
        userId: user.id,
      },
    });

    return {
      status: 'success',
      message: 'Đánh giá đã được gửi thành công'
    };
  } catch (error) {
    console.error('Error creating review:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Không thể tạo đánh giá'
    };
  }
};

export const updateReviewAction = async (
  reviewId: string,
  rating: number,
  comment?: string
): Promise<ApiResponse> => {
  try {
    const user = await requireUser();

    // Validate rating
    if (rating < 1 || rating > 5) {
      return {
        status: 'error',
        message: 'Đánh giá phải từ 1 đến 5 sao'
      };
    }

    // Check if review exists and belongs to user
    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      return {
        status: 'error',
        message: 'Không tìm thấy đánh giá'
      };
    }

    if (review.userId !== user.id) {
      return {
        status: 'error',
        message: 'Bạn chỉ có thể cập nhật đánh giá của chính mình'
      };
    }

    // Update review
    await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        rating,
        comment: comment || null,
      },
    });

    return {
      status: 'success',
      message: 'Review updated successfully'
    };
  } catch (error) {
    console.error('Error updating review:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Không thể cập nhật đánh giá'
    };
  }
};

export const deleteReviewAction = async (
  reviewId: string
): Promise<ApiResponse> => {
  try {
    const user = await requireUser();

    // Check if review exists and belongs to user
    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      return {
        status: 'error',
        message: 'Không tìm thấy đánh giá'
      };
    }

    if (review.userId !== user.id) {
      return {
        status: 'error',
        message: 'Bạn chỉ có thể xóa đánh giá của chính mình'
      };
    }

    // Delete review
    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    return {
      status: 'success',
      message: 'Đánh giá đã được xóa thành công'
    };
  } catch (error) {
    console.error('Error deleting review:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Không thể xóa đánh giá'
    };
  }
};

export const getUserReviewForCourse = async (courseId: string) => {
  try {
    const user = await requireUser();

    const review = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return review;
  } catch (error) {
    return null;
  }
};
