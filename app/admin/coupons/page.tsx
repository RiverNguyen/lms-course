import { CouponsTable } from "@/app/admin/coupons/_components/coupons-table";
import { adminGetCoupons } from "@/app/data/admin/admin-get-coupons";
import EmptyState from "@/components/general/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Suspense } from "react";

export default function AdminCouponsPage() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mã giảm giá</h1>
          <p className="mt-1 text-muted-foreground">
            Quản lý mã giảm giá và khuyến mãi theo thời gian
          </p>
        </div>
        <Link href="/admin/coupons/create" className={buttonVariants()}>
          Tạo mã giảm giá
        </Link>
      </div>

      <Suspense fallback={<CouponsTableSkeleton />}>
        <RenderCoupons />
      </Suspense>
    </>
  );
}

async function RenderCoupons() {
  const data = await adminGetCoupons();

  if (!data?.length) {
    return (
      <EmptyState
        title="Chưa có mã giảm giá nào"
        description="Tạo mã giảm giá để áp dụng cho đơn hàng"
        buttonText="Tạo mã giảm giá"
        href="/admin/coupons/create"
      />
    );
  }

  return <CouponsTable coupons={data} />;
}

function CouponsTableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border">
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
