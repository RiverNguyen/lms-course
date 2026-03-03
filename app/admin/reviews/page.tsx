import { ReviewsTable } from "@/app/admin/reviews/_components/reviews-table";
import { adminGetReviews } from "@/app/data/admin/admin-get-reviews";
import EmptyState from "@/components/general/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

const ReviewsPage = () => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Đánh giá</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và theo dõi tất cả đánh giá từ người dùng
          </p>
        </div>
      </div>

      <Suspense fallback={<ReviewsTableSkeleton />}>
        <RenderReviews />
      </Suspense>
    </>
  );
};

async function RenderReviews() {
  const data = await adminGetReviews();

  return (
    <>
      {data?.length > 0 ? (
        <ReviewsTable reviews={data} />
      ) : (
        <EmptyState
          title="Chưa có đánh giá nào"
          description="Đánh giá sẽ hiển thị ở đây khi người dùng đánh giá khóa học"
          buttonText=""
          href=""
        />
      )}
    </>
  );
}

function ReviewsTableSkeleton() {
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

export default ReviewsPage;
