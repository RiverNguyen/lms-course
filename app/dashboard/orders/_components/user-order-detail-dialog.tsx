"use client";

import { UserOrderType } from "@/app/data/user/get-user-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const formatDate = (d: Date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
};

const formatVnd = (value: string) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};

const statusLabels: Record<string, string> = {
  Pending: "Chờ xử lý",
  Processing: "Đang xử lý",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
  Refunded: "Đã hoàn tiền",
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Pending: "secondary",
  Processing: "default",
  Completed: "default",
  Cancelled: "destructive",
  Refunded: "outline",
};

export function UserOrderDetailDialog({
  order,
  children,
}: {
  order: UserOrderType;
  children: React.ReactNode;
}) {
  const items = order.orderItems;
  const coupon = order.coupon;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono">{order.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Trạng thái</span>
            <Badge variant={statusVariants[order.status] ?? "secondary"}>
              {statusLabels[order.status] ?? order.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Ngày đặt</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>

          <Separator />

          <div>
            <div className="font-medium text-muted-foreground mb-2">
              Khóa học đã mua
            </div>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <Link
                    href={`/courses/${item.courseSlug}`}
                    className="text-primary hover:underline truncate flex-1 min-w-0"
                  >
                    {item.courseTitle}
                  </Link>
                  {item.quantity > 1 ? (
                    <span className="text-muted-foreground shrink-0">
                      × {item.quantity}
                    </span>
                  ) : null}
                  <span className="shrink-0">{formatVnd(item.coursePrice)}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tạm tính</span>
              <span>{formatVnd(order.subtotal)}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-muted-foreground">
                <span>Mã giảm giá ({coupon.code})</span>
                <span>
                  {order.discountAmount && order.discountAmount !== "0"
                    ? formatVnd(order.discountAmount)
                    : "—"}
                </span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-1">
              <span>Tổng thanh toán</span>
              <span>{formatVnd(order.total)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
