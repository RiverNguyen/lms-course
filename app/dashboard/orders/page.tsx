import { getUserOrders } from "@/app/data/user/get-user-orders";
import { UserOrdersTable } from "./_components/user-orders-table";
import EmptyState from "@/components/general/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lịch sử mua hàng",
  description: "Xem các đơn hàng và khóa học bạn đã mua.",
  robots: { index: false, follow: false },
};

function OrdersTableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Skeleton className="h-9 w-full max-w-sm" />
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

export default async function DashboardOrdersPage() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lịch sử mua hàng</h1>
          <p className="mt-1 text-muted-foreground">
            Xem các đơn hàng và khóa học bạn đã thanh toán
          </p>
        </div>
      </div>

      <Suspense fallback={<OrdersTableSkeleton />}>
        <RenderOrders />
      </Suspense>
    </>
  );
}

async function RenderOrders() {
  const orders = await getUserOrders();

  if (!orders.length) {
    return (
      <EmptyState
        title="Chưa có đơn hàng nào"
        description="Các đơn hàng của bạn sẽ hiển thị ở đây sau khi thanh toán khóa học."
        buttonText="Xem khóa học"
        href="/courses"
      />
    );
  }

  return <UserOrdersTable orders={orders} />;
}
