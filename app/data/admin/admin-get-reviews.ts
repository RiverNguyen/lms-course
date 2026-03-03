import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/prisma";

export const adminGetReviews = async () => {
  await requireAdmin();

  const data = await prisma.review.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  return data;
};

export type AdminReviewType = Awaited<
  ReturnType<typeof adminGetReviews>
>[number];
