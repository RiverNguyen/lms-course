import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type WishlistCourseItem = {
  id: string;
  title: string;
  price: string;
  smallDescription: string;
  slug: string;
  fileKey: string;
  level: string;
  duration: string;
  category: { id: string; name: string; slug: string } | null;
};

/**
 * Returns courses in the current user's wishlist.
 * Returns empty array if not logged in.
 */
export async function getWishlistCourses(): Promise<WishlistCourseItem[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) return [];

  const wishlists = await prisma.wishlist.findMany({
    where: {
      userId: session.user.id,
      course: { status: "Published" },
    },
    orderBy: { createdAt: "desc" },
    select: {
      course: {
        select: {
          id: true,
          title: true,
          price: true,
          smallDescription: true,
          slug: true,
          fileKey: true,
          level: true,
          duration: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });

  return wishlists
    .map((w) => w.course)
    .filter((c): c is NonNullable<typeof c> => c != null)
    .map((c) => ({
      ...c,
      level: c.level,
      category: c.category,
    }));
}
