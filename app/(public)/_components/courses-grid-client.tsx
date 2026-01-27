"use client";

import { motion } from "motion/react";
import PublicCourseCard from "@/app/(public)/_components/public-course-card";
import { AllCoursesType } from "@/app/data/course/get-all-courses";

interface CoursesGridClientProps {
  courses: AllCoursesType[];
}

export const CoursesGridClient = ({ courses }: CoursesGridClientProps) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No courses available yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {courses.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -5 }}
        >
          <PublicCourseCard data={course} />
        </motion.div>
      ))}
    </div>
  );
};
