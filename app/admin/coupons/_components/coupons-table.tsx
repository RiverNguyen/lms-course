"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { AdminCoupon } from "@/app/data/admin/admin-get-coupons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteCouponAction } from "../actions";
import { tryCatch } from "@/hooks/try-catch";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d));
}

interface CouponsTableProps {
  coupons: AdminCoupon[];
}

export function CouponsTable({ coupons }: CouponsTableProps) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [couponToDelete, setCouponToDelete] = React.useState<AdminCoupon | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const columns: ColumnDef<AdminCoupon>[] = [
    {
      accessorKey: "code",
      header: "Mã",
      cell: ({ row }) => (
        <span className="font-mono font-semibold">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Loại",
      cell: ({ row }) =>
        row.original.type === "Percent" ? (
          <Badge variant="secondary">{row.original.value}%</Badge>
        ) : (
          <Badge variant="outline">
            {row.original.value.toLocaleString("vi-VN")} VND
          </Badge>
        ),
    },
    {
      accessorKey: "minPurchase",
      header: "Đơn tối thiểu",
      cell: ({ row }) => {
        const v = row.original.minPurchase;
        return v != null ? `${v.toLocaleString("vi-VN")} VND` : "—";
      },
    },
    {
      accessorKey: "usedCount",
      header: "Đã dùng",
      cell: ({ row }) => {
        const u = row.original.usedCount;
        const max = row.original.maxUses;
        return max != null ? `${u}/${max}` : String(u);
      },
    },
    {
      accessorKey: "startAt",
      header: "Bắt đầu",
      cell: ({ row }) => formatDate(row.original.startAt),
    },
    {
      accessorKey: "endAt",
      header: "Kết thúc",
      cell: ({ row }) => formatDate(row.original.endAt),
    },
    {
      accessorKey: "active",
      header: "Trạng thái",
      cell: ({ row }) =>
        row.original.active ? (
          <Badge className="bg-green-600">Đang hoạt động</Badge>
        ) : (
          <Badge variant="secondary">Tắt</Badge>
        ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/coupons/${c.id}/edit`}>
                  <Pencil className="size-4 mr-2" />
                  Chỉnh sửa
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setCouponToDelete(c);
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="size-4 mr-2" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: coupons,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const handleDelete = () => {
    if (!couponToDelete) return;
    startTransition(async () => {
      const { data, error } = await tryCatch(deleteCouponAction(couponToDelete.id));
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data?.status === "success") {
        toast.success(data.message);
        setDeleteOpen(false);
        setCouponToDelete(null);
        router.refresh();
      }
    });
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Chưa có mã giảm giá nào
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {coupons.length > 10 && (
        <div className="flex items-center justify-end gap-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa mã giảm giá?</AlertDialogTitle>
            <AlertDialogDescription>
              Mã &quot;{couponToDelete?.code}&quot; sẽ bị xóa. Chỉ xóa được khi chưa có đơn nào sử dụng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
