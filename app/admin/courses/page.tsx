import { CoursesTable } from "@/app/admin/courses/_components/courses-table";
import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import EmptyState from "@/components/general/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Suspense } from "react";

const CoursesPage = () => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Khóa học của Bạn</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và sắp xếp tất cả khóa học của bạn
          </p>
        </div>
        <Link href="/admin/courses/create" className={buttonVariants()}>
          Tạo Khóa học
        </Link>
      </div>

      <Suspense fallback={<CoursesTableSkeleton />}>
        <RenderCourses />
      </Suspense>
    </>
  );
};

async function RenderCourses() {
  const data = await adminGetCourses();

  return (
    <>
      {data?.length > 0 ? (
        <CoursesTable courses={data} />
      ) : (
        <EmptyState
          title="Chưa có khóa học nào"
          description="Tạo khóa học mới để bắt đầu"
          buttonText="Tạo Khóa học"
          href="/admin/courses/create"
        />
      )}
    </>
  );
}

function CoursesTableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-9 w-[180px]" />
      </div>
      <div className="rounded-md border">
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CoursesPage;
