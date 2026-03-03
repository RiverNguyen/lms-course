"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AdminOrderType } from "@/app/data/admin/admin-get-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  SearchIcon,
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "secondary",
  Processing: "default",
  Completed: "default",
  Cancelled: "destructive",
  Refunded: "outline",
};

interface OrdersTableProps {
  orders: AdminOrderType[];
}

function OrderDetailDialog({
  order,
  children,
}: {
  order: AdminOrderType;
  children: React.ReactNode;
}) {
  const user = order.user;
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
          {/* Người mua */}
          <div>
            <div className="font-medium text-muted-foreground mb-1">Người mua</div>
            {user ? (
              <div className="flex items-center gap-3">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-muted-foreground">{user.email}</div>
                </div>
              </div>
            ) : (
              <span className="italic text-muted-foreground">Khách (đã xóa)</span>
            )}
          </div>

          <Separator />

          {/* Khóa học */}
          <div>
            <div className="font-medium text-muted-foreground mb-2">Khóa học</div>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <span>{item.courseTitle}</span>
                  {item.quantity > 1 ? (
                    <span className="text-muted-foreground shrink-0">× {item.quantity}</span>
                  ) : null}
                  <span className="shrink-0">{formatVnd(item.coursePrice)}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Thanh toán */}
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

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Trạng thái</span>
            <Badge variant={statusVariants[order.status] ?? "secondary"}>
              {statusLabels[order.status] ?? order.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Ngày tạo</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const columns: ColumnDef<AdminOrderType>[] = [
    {
      accessorKey: "orderNumber",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Mã đơn
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">
          {row.original.orderNumber}
        </span>
      ),
    },
    {
      id: "user",
      header: "Người mua",
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) {
          return <span className="text-muted-foreground italic">Khách (đã xóa)</span>;
        }
        return (
          <div className="flex items-center gap-3">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "subtotal",
      header: "Tạm tính",
      cell: ({ row }) => (
        <span className="text-sm">{formatVnd(row.original.subtotal)}</span>
      ),
    },
    {
      accessorKey: "discountAmount",
      header: "Giảm giá",
      cell: ({ row }) => {
        const v = row.original.discountAmount;
        const amount = v && v !== "0" ? formatVnd(v) : "—";
        const coupon = row.original.coupon;
        return (
          <div className="space-y-0.5">
            {coupon && (
              <div className="text-xs text-muted-foreground">{coupon.code}</div>
            )}
            <span className="text-sm">{amount}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Tổng thanh toán
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold">{formatVnd(row.original.total)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={statusVariants[status] ?? "secondary"}>
            {statusLabels[status] ?? status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Ngày tạo
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const order = row.original;
        return (
          <OrderDetailDialog order={order}>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5">
              <EyeIcon className="h-4 w-4" />
              Xem chi tiết
            </Button>
          </OrderDetailDialog>
        );
      },
    },
  ];

  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm w-full">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã đơn..."
            value={(table.getColumn("orderNumber")?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn("orderNumber")?.setFilterValue(e.target.value)
            }
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Trạng thái:</span>
          <Select
            value={
              (table.getColumn("status")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Không có đơn hàng nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Hiển thị {table.getRowModel().rows.length} trong{" "}
          {table.getFilteredRowModel().rows.length} đơn hàng
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Dòng mỗi trang:</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Trước
            </Button>
            <span className="text-sm text-muted-foreground">
              Trang {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sau
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
