"use client";

import { CourseSidebarData } from "@/app/data/course/get-course-sidebar-data";
import { useMemo } from "react"

interface UseCourseProgressProps {
  course: CourseSidebarData["course"];
}

interface UseCourseProgressReturnType {
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

export const useCourseProgress = ({ course }: UseCourseProgressProps): UseCourseProgressReturnType => {
  return useMemo<UseCourseProgressReturnType>(() => {
    let totalLessons = 0;
    let completedLessons = 0;

    course.chapters.forEach((chapter) => {
      chapter.lessons.forEach((lesson) => {
        totalLessons++;

        const isCompleted = lesson.lessonProgresses.some((progress) => progress.lessonId === lesson.id && progress.completed);

        if (isCompleted) {
          completedLessons++;
        }
      });
    });

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      totalLessons,
      completedLessons,
      progressPercentage,
    };
  }, [course]);
};