"use client";

import { FilteredCourseType } from "@/app/data/course/get-filtered-courses";
import { CourseFiltersType } from "@/app/data/course/get-course-filters";
import CourseListCard from "./course-list-card";
import CourseFiltersSidebar from "./course-filters-sidebar";
import CourseSearchBar from "./course-search-bar";
import CoursePagination from "./course-pagination";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import PublicCourseCard from "@/app/(public)/_components/public-course-card";
import { AllCoursesType } from "@/app/data/course/get-all-courses";

interface CoursesListClientProps {
  courses: FilteredCourseType[];
  filters: CourseFiltersType;
  totalPages: number;
  currentPage: number;
}

const CoursesListClient = ({
  courses,
  filters,
  totalPages,
  currentPage,
}: CoursesListClientProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Get filter values from URL
  const categories = searchParams.get("categories")?.split(",").filter(Boolean) || [];
  const levels = searchParams.get("levels")?.split(",").filter(Boolean) || [];
  const price = (searchParams.get("price") as "all" | "free" | "paid") || "all";

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentCategories = categories.includes(categoryId)
      ? categories.filter((id) => id !== categoryId)
      : [...categories, categoryId];

    if (currentCategories.length > 0) {
      params.set("categories", currentCategories.join(","));
    } else {
      params.delete("categories");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleLevelChange = (level: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (level === "all") {
      params.delete("levels");
    } else {
      params.set("levels", level);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePriceChange = (newPrice: "all" | "free" | "paid") => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPrice === "all") {
      params.delete("price");
    } else {
      params.set("price", newPrice);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Convert FilteredCourseType to AllCoursesType for grid view compatibility
  const gridCourses: AllCoursesType[] = courses.map((course) => ({
    id: course.id,
    title: course.title,
    price: course.price,
    smallDescription: course.smallDescription,
    slug: course.slug,
    fileKey: course.fileKey,
    level: course.level,
    duration: course.duration,
    category: course.category,
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Search Bar */}
        <div className="mb-6">
          <CourseSearchBar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Course List/Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No courses found. Try adjusting your filters.
            </p>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-4">
            {courses.map((course) => (
              <CourseListCard key={course.id} data={course} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridCourses.map((course) => (
              <PublicCourseCard key={course.id} data={course} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <CoursePagination currentPage={currentPage} totalPages={totalPages} />
      </div>

      {/* Filters Sidebar */}
      <aside className="lg:w-80 flex-shrink-0">
        <div className="sticky top-4">
          <CourseFiltersSidebar
            filters={filters}
            selectedCategories={categories}
            selectedLevels={levels}
            selectedPrice={price}
            onCategoryChange={handleCategoryChange}
            onLevelChange={handleLevelChange}
            onPriceChange={handlePriceChange}
          />
        </div>
      </aside>
    </div>
  );
};

export default CoursesListClient;
