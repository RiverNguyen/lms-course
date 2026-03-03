import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Returns course IDs in the current user's wishlist.
 * Returns empty array if not logged in.
 */
export async function getWishlistCourseIds(): Promise<string[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) return [];

  const items = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    select: { courseId: true },
  });

  return items.map((item) => item.courseId);
}
