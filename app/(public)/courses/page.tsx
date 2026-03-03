import { Suspense } from "react";
import type { Metadata } from "next";
import { getFilteredCourses } from "@/app/data/course/get-filtered-courses";
import { getCourseFilters } from "@/app/data/course/get-course-filters";
import { getWishlistCourseIds } from "@/app/data/wishlist/get-wishlist-course-ids";
import CoursesListClient from "./_components/courses-list-client";
import { PublicCourseCardSkeleton } from "@/app/(public)/_components/public-course-card";

export const metadata: Metadata = {
  title: "Tất cả Khóa học",
  description: "Khám phá nhiều khóa học đa dạng về nhiều chủ đề. Duyệt danh mục khóa học toàn diện của chúng tôi và tìm lộ trình học tập hoàn hảo cho sự nghiệp của bạn.",
  keywords: ["khóa học", "khóa học trực tuyến", "học tập", "giáo dục", "phát triển kỹ năng", "phát triển chuyên nghiệp"],
  openGraph: {
    title: "Tất cả Khóa học - TunaLMS",
    description: "Khám phá nhiều khóa học đa dạng về nhiều chủ đề. Duyệt danh mục khóa học toàn diện của chúng tôi.",
    url: "/courses",
  },
  alternates: {
    canonical: "/courses",
  },
};

interface CoursesPageProps {
  searchParams: Promise<{
    search?: string;
    categories?: string;
    levels?: string;
    price?: string;
    page?: string;
  }>;
}

const CoursesPage = async ({ searchParams }: CoursesPageProps) => {
  const params = await searchParams;

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
      <div className="flex flex-col space-y-2 mb-6 mt-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
          Tất cả Khóa học
        </h1>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="h-12 bg-muted rounded-md mb-6 animate-pulse" />
              <div className="space-y-4">
                <div className="h-48 bg-muted rounded-md animate-pulse" />
              </div>
            </div>
            <div className="lg:w-80">
              <div className="h-96 bg-muted rounded-md animate-pulse" />
            </div>
          </div>
        }
      >
        <RenderCourses params={params} />
      </Suspense>
    </div>
  );
};

async function RenderCourses({
  params,
}: {
  params: {
    search?: string;
    categories?: string;
    levels?: string;
    price?: string;
    page?: string;
  };
}) {
  const categories = params.categories?.split(",").filter(Boolean) || [];
  const levels = params.levels?.split(",").filter(Boolean) || [];
  const price = (params.price as "all" | "free" | "paid") || "all";
  const page = parseInt(params.page || "1", 10);

  const [coursesData, filters, wishlistCourseIds] = await Promise.all([
    getFilteredCourses({
      search: params.search,
      categories,
      levels,
      price,
      page,
      pageSize: 6,
    }),
    getCourseFilters(),
    getWishlistCourseIds(),
  ]);

  return (
    <CoursesListClient
      courses={coursesData.courses}
      filters={filters}
      totalPages={coursesData.totalPages}
      currentPage={coursesData.page}
      wishlistCourseIds={wishlistCourseIds}
    />
  );
}

export default CoursesPage;
