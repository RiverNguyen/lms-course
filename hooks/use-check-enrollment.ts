"use client";

import { useState, useEffect } from "react";

export const useCheckEnrollment = (courseId: string) => {
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const response = await fetch("/api/cart/check-enrollment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseIds: [courseId] }),
        });

        const data = await response.json();
        setIsEnrolled(data.enrolled[courseId] || false);
      } catch (error) {
        console.error("Error checking enrollment:", error);
        setIsEnrolled(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      checkEnrollment();
    }
  }, [courseId]);

  return { isEnrolled, isLoading };
};

export const useCheckMultipleEnrollments = (courseIds: string[]) => {
  const [enrolledMap, setEnrolledMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkEnrollments = async () => {
      if (courseIds.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/cart/check-enrollment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseIds }),
        });

        const data = await response.json();
        setEnrolledMap(data.enrolled || {});
      } catch (error) {
        console.error("Error checking enrollments:", error);
        setEnrolledMap({});
      } finally {
        setIsLoading(false);
      }
    };

    checkEnrollments();
  }, [courseIds.join(",")]);

  return { enrolledMap, isLoading };
};
