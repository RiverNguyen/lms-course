"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type ToggleWishlistResult =
  | { success: true; inWishlist: boolean }
  | { success: false; error: string };

export async function toggleWishlistAction(
  courseId: string
): Promise<ToggleWishlistResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, error: "Vui lòng đăng nhập để sử dụng wishlist." };
  }

  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_courseId: { userId: session.user.id, courseId },
    },
  });

  if (existing) {
    await prisma.wishlist.delete({
      where: { id: existing.id },
    });
    revalidatePath("/wishlist");
    revalidatePath("/courses");
    revalidatePath("/");
    return { success: true, inWishlist: false };
  }

  // Verify course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });
  if (!course) {
    return { success: false, error: "Khóa học không tồn tại." };
  }

  await prisma.wishlist.create({
    data: {
      userId: session.user.id,
      courseId,
    },
  });
  revalidatePath("/wishlist");
  revalidatePath("/courses");
  revalidatePath("/");
  return { success: true, inWishlist: true };
}
