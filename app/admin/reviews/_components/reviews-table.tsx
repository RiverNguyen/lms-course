"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AdminReviewType } from "@/app/data/admin/admin-get-reviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  SearchIcon,
  Loader2Icon,
  Trash2Icon,
  EyeIcon,
  StarIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/try-catch";
import { DeleteReview } from "../actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";

// Date formatting helper
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Star rating component
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating}/5</span>
    </div>
  );
};

interface ReviewsTableProps {
  reviews: AdminReviewType[];
}

export function ReviewsTable({ reviews }: ReviewsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      updatedAt: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedReview, setSelectedReview] =
    React.useState<AdminReviewType | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Show/hide columns based on screen size
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setColumnVisibility({
          updatedAt: false,
          comment: false,
        });
      } else if (window.innerWidth < 1024) {
        setColumnVisibility({
          updatedAt: false,
        });
      } else {
        setColumnVisibility({});
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDeleteClick = (review: AdminReviewType) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedReview) return;

    startTransition(async () => {
      const { data: response, error } = await tryCatch(
        DeleteReview(selectedReview.id)
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      if (response?.status === "success") {
        toast.success(response.message);
        setDeleteDialogOpen(false);
        setSelectedReview(null);
        router.refresh();
      } else if (response?.status === "error") {
        toast.error(response.message);
      }
    });
  };

  const columns: ColumnDef<AdminReviewType>[] = [
    {
      id: "select",
      enableHiding: false,
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Chọn dòng"
        />
      ),
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Chọn tất cả"
        />
      ),
    },
    {
      accessorKey: "rating",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Đánh giá
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const rating = row.getValue("rating") as number;
        return <StarRating rating={rating} />;
      },
    },
    {
      accessorKey: "user.name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Người dùng
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original.user;
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
      accessorKey: "course.title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Khóa học
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const course = row.original.course;
        return (
          <Link
            href={`/courses/${course.slug}`}
            className="font-medium hover:underline text-primary"
          >
            {course.title}
          </Link>
        );
      },
    },
    {
      accessorKey: "comment",
      header: "Bình luận",
      cell: ({ row }) => {
        const comment = row.original.comment;
        return comment ? (
          <div className="max-w-[400px]">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {comment}
            </p>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground italic">
            Không có bình luận
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Ngày tạo
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <div className="text-sm text-muted-foreground">{formatDate(date)}</div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Cập nhật
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("updatedAt"));
        return (
          <div className="text-sm text-muted-foreground">{formatDate(date)}</div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const review = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/courses/${review.course.slug}`}>
                  <EyeIcon className="mr-2 h-4 w-4" />
                  Xem Khóa học
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDeleteClick(review)}
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                Xóa Đánh giá
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: reviews,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm đánh giá..."
              value={(table.getColumn("user.name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("user.name")?.setFilterValue(event.target.value)
              }
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={
              (table.getColumn("rating")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(value) => {
              if (value === "all") {
                table.getColumn("rating")?.setFilterValue(undefined);
              } else {
                table.getColumn("rating")?.setFilterValue(Number(value));
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo đánh giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đánh giá</SelectItem>
              <SelectItem value="5">5 sao</SelectItem>
              <SelectItem value="4">4 sao</SelectItem>
              <SelectItem value="3">3 sao</SelectItem>
              <SelectItem value="2">2 sao</SelectItem>
              <SelectItem value="1">1 sao</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không tìm thấy đánh giá nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Hiển thị {table.getRowModel().rows.length} trong{" "}
          {table.getFilteredRowModel().rows.length} đánh giá
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span className="ml-2">
              ({table.getFilteredSelectedRowModel().rows.length} đã chọn)
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Dòng mỗi trang:</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
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
            <div className="text-sm text-muted-foreground">
              Trang {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount()}
            </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Sẽ xóa đánh giá của <strong>{selectedReview?.user.name}</strong> cho khóa học{" "}
              <strong>{selectedReview?.course.title}</strong>. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xóa Đánh giá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
