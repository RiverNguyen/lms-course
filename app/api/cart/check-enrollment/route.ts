import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { courseIds } = await request.json();

    if (!courseIds || !Array.isArray(courseIds)) {
      return NextResponse.json(
        { error: "Invalid course IDs" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ enrolled: {} }, { status: 200 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.user.id,
        courseId: { in: courseIds },
        status: "Active",
      },
      select: {
        courseId: true,
      },
    });

    const enrolledCourseIds = enrollments.map((e) => e.courseId);
    const enrolledMap: Record<string, boolean> = {};
    
    courseIds.forEach((courseId: string) => {
      enrolledMap[courseId] = enrolledCourseIds.includes(courseId);
    });

    return NextResponse.json({ enrolled: enrolledMap }, { status: 200 });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return NextResponse.json(
      { error: "Failed to check enrollment" },
      { status: 500 }
    );
  }
}
