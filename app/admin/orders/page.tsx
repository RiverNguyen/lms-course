import { OrdersTable } from "@/app/admin/orders/_components/orders-table";
import { adminGetOrders } from "@/app/data/admin/admin-get-orders";
import EmptyState from "@/components/general/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

const AdminOrdersPage = () => {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đơn hàng</h1>
          <p className="mt-1 text-muted-foreground">
            Xem danh sách đơn hàng và người dùng đã thanh toán
          </p>
        </div>
      </div>

      <Suspense fallback={<OrdersTableSkeleton />}>
        <RenderOrders />
      </Suspense>
    </>
  );
};

async function RenderOrders() {
  const data = await adminGetOrders();

  if (!data?.length) {
    return (
      <EmptyState
        title="Chưa có đơn hàng nào"
        description="Đơn hàng sẽ hiển thị ở đây khi người dùng thanh toán khóa học"
        buttonText=""
        href=""
      />
    );
  }

  return <OrdersTable orders={data} />;
}

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

export default AdminOrdersPage;
