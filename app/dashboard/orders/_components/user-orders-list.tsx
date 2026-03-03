"use client";

import { UserOrderType } from "@/app/data/user/get-user-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserOrderDetailDialog } from "./user-order-detail-dialog";

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

interface UserOrdersListProps {
  orders: UserOrderType[];
}

export function UserOrdersList({ orders }: UserOrdersListProps) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-mono">
              {order.orderNumber}
            </CardTitle>
            <Badge variant={statusVariants[order.status] ?? "secondary"}>
              {statusLabels[order.status] ?? order.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-3">
              {formatDate(order.createdAt)}
            </CardDescription>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Tổng: </span>
                <span className="font-semibold">{formatVnd(order.total)}</span>
              </div>
              <UserOrderDetailDialog order={order}>
                <Button variant="outline" size="sm">
                  Xem chi tiết
                </Button>
              </UserOrderDetailDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
