import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/courses/by-slug?slug=xxx - Trả về title, level, category, price để bổ sung thẻ khóa (AI assistant). */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json(
      { error: "Missing slug" },
      { status: 400 }
    );
  }

  const course = await prisma.course.findFirst({
    where: { slug, status: "Published" },
    select: {
      title: true,
      slug: true,
      level: true,
      price: true,
      category: { select: { name: true } },
    },
  });

  if (!course) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json({
    title: course.title,
    slug: course.slug,
    level: course.level ?? undefined,
    category: course.category?.name ?? undefined,
    price: course.price ?? "0",
  });
}
