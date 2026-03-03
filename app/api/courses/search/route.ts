import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LIMIT = 6;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ courses: [] });
  }

  const where = {
    status: "Published" as const,
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { smallDescription: { contains: q, mode: "insensitive" as const } },
      { category: { name: { contains: q, mode: "insensitive" as const } } },
      { user: { name: { contains: q, mode: "insensitive" as const } } },
    ],
  };

  const courses = await prisma.course.findMany({
    where,
    take: LIMIT,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      smallDescription: true,
      level: true,
      fileKey: true,
      category: { select: { name: true } },
    },
  });

  return NextResponse.json({ courses });
}
