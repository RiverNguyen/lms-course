import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Check if a user has completed all lessons in a course
 * and create certificate if completed
 */
export async function checkCourseCompletionAndIssueCertificate(
  userId: string,
  courseId: string
): Promise<{ isCompleted: boolean; certificateId?: string }> {
  // Get course with all lessons
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        include: {
          lessons: true,
        },
      },
    },
  });

  if (!course) {
    return { isCompleted: false };
  }

  // Count total lessons
  const totalLessons = course.chapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0
  );

  if (totalLessons === 0) {
    return { isCompleted: false };
  }

  // Count completed lessons
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId,
      completed: true,
      lesson: {
        chapter: {
          courseId,
        },
      },
    },
  });

  const isCompleted = completedLessons === totalLessons;

  if (!isCompleted) {
    return { isCompleted: false };
  }

  // Check if certificate already exists
  const existingCertificate = await prisma.certificate.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existingCertificate) {
    return {
      isCompleted: true,
      certificateId: existingCertificate.id,
    };
  }

  // Generate certificate number
  const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  // Create certificate
  const certificate = await prisma.certificate.create({
    data: {
      certificateNumber,
      userId,
      courseId,
    },
  });

  // Update enrollment status to Completed
  await prisma.enrollment.updateMany({
    where: {
      userId,
      courseId,
      status: "Active",
    },
    data: {
      status: "Completed",
    },
  });

  return {
    isCompleted: true,
    certificateId: certificate.id,
  };
}
