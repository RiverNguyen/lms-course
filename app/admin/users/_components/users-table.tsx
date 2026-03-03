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
import { AdminUserType } from "@/app/data/admin/admin-get-users";
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
  BanIcon,
  CheckCircle2Icon,
  BookOpenIcon,
  ShoppingCartIcon,
  EyeIcon,
  Loader2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/try-catch";
import { banUser, unbanUser } from "../actions";
import { BanDialog } from "./ban-dialog";
import { UserInfoDialog } from "./user-info-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

// Date formatting helper
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

interface UsersTableProps {
  users: AdminUserType[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      updatedAt: false,
      banReason: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [banDialogOpen, setBanDialogOpen] = React.useState(false);
  const [unbanDialogOpen, setUnbanDialogOpen] = React.useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] =
    React.useState<AdminUserType | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Show/hide columns based on screen size
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setColumnVisibility({
          updatedAt: false,
          banReason: false,
          role: false,
        });
      } else if (window.innerWidth < 1024) {
        setColumnVisibility({
          updatedAt: false,
          banReason: false,
        });
      } else {
        setColumnVisibility({
          updatedAt: false,
          banReason: false,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBanClick = (user: AdminUserType) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };

  const handleUnbanClick = (user: AdminUserType) => {
    setSelectedUser(user);
    setUnbanDialogOpen(true);
  };

  const handleViewInfoClick = (user: AdminUserType) => {
    setSelectedUser(user);
    // Trì hoãn mở dialog để dropdown đóng trước, tránh xung đột Radix
    setTimeout(() => setInfoDialogOpen(true), 0);
  };

  const handleBanConfirm = async (banReason: string) => {
    if (!selectedUser) return;

    startTransition(async () => {
      const { data: response, error } = await tryCatch(
        banUser(selectedUser.id, banReason)
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      if (response?.status === "success") {
        toast.success(response.message);
        setBanDialogOpen(false);
        setSelectedUser(null);
        router.refresh();
      } else if (response?.status === "error") {
        toast.error(response.message);
      }
    });
  };

  const handleUnbanConfirm = () => {
    if (!selectedUser) return;

    startTransition(async () => {
      const { data: response, error } = await tryCatch(
        unbanUser(selectedUser.id)
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      if (response?.status === "success") {
        toast.success(response.message);
        setUnbanDialogOpen(false);
        setSelectedUser(null);
        router.refresh();
      } else if (response?.status === "error") {
        toast.error(response.message);
      }
    });
  };

  const columns: ColumnDef<AdminUserType>[] = [
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Tên
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original;
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
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Vai trò
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const role = row.getValue("role") as string | null;
        return (
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            {role || "user"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "banned",
      header: "Trạng thái",
      cell: ({ row }) => {
        const banned = row.getValue("banned") as boolean | null;
        return (
          <Badge variant={banned ? "destructive" : "default"}>
            {banned ? (
              <>
                <BanIcon className="mr-1 h-3 w-3" />
                Đã khóa
              </>
            ) : (
              <>
                <CheckCircle2Icon className="mr-1 h-3 w-3" />
                Hoạt động
              </>
            )}
          </Badge>
        );
      },
    },
    {
      accessorKey: "banReason",
      header: "Lý do khóa",
      cell: ({ row }) => {
        const reason = row.original.banReason;
        return reason ? (
          <div className="max-w-[300px]">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {reason}
            </p>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground italic">—</span>
        );
      },
    },
    {
      accessorKey: "_count.courses",
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
        const count = row.original._count.courses;
        return (
          <div className="flex items-center gap-2">
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{count}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "_count.enrollments",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Đăng ký
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const count = row.original._count.enrollments;
        return (
          <div className="flex items-center gap-2">
            <ShoppingCartIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{count}</span>
          </div>
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
          <div className="text-sm text-muted-foreground">
            {formatDate(date)}
          </div>
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
          <div className="text-sm text-muted-foreground">
            {formatDate(date)}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        const isBanned = user.banned === true;

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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewInfoClick(user)}>
                <EyeIcon className="mr-2 h-4 w-4" />
                Xem thông tin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isBanned ? (
                <DropdownMenuItem
                  onClick={() => handleUnbanClick(user)}
                  disabled={user.role === "admin"}
                >
                  <CheckCircle2Icon className="mr-2 h-4 w-4" />
                  Bỏ khóa Người dùng
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => handleBanClick(user)}
                  disabled={user.role === "admin"}
                  className="text-destructive"
                >
                  <BanIcon className="mr-2 h-4 w-4" />
                  Khóa Người dùng
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
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
      {/* Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm người dùng..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-8"
            />
          </div>
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
                  Không tìm thấy người dùng nào.
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
          {table.getFilteredRowModel().rows.length} người dùng
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

      {/* Ban Dialog */}
      {selectedUser && (
        <BanDialog
          open={banDialogOpen}
          onOpenChange={setBanDialogOpen}
          userName={selectedUser.name}
          onConfirm={handleBanConfirm}
          isPending={isPending}
        />
      )}

      {/* User Info Dialog */}
      <UserInfoDialog
        open={infoDialogOpen}
        onOpenChange={setInfoDialogOpen}
        user={selectedUser}
      />

      {/* Unban Confirmation Dialog */}
      <AlertDialog open={unbanDialogOpen} onOpenChange={setUnbanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Sẽ bỏ khóa <strong>{selectedUser?.name}</strong> và khôi phục
              quyền truy cập của họ vào nền tảng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnbanConfirm}
              disabled={isPending}
            >
              {isPending && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Bỏ khóa Người dùng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
