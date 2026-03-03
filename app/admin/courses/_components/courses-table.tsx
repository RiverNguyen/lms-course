"use client"

import * as React from "react"
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
} from "@tanstack/react-table"
import { AdminCourseType } from "@/app/data/admin/admin-get-courses"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
  Loader2Icon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { BulkDeleteCourses, BulkUpdateCourseStatus } from "../bulk-actions"
import { tryCatch } from "@/hooks/try-catch"
// Date formatting helper
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date)
}

type CourseStatus = "Draft" | "Published" | "Archived"

const statusColors: Record<CourseStatus, string> = {
  Draft: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  Published: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  Archived: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
}

const statusLabels: Record<CourseStatus, string> = {
  Draft: "Bản nháp",
  Published: "Đã xuất bản",
  Archived: "Đã lưu trữ",
}

const levelColors: Record<string, string> = {
  Beginner: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Intermediate: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Advanced: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
}

const levelLabels: Record<string, string> = {
  Beginner: "Người mới bắt đầu",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
}

interface CoursesTableProps {
  courses: AdminCourseType[]
}

export function CoursesTable({ courses }: CoursesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    updatedAt: false,
    price: false,
  })
  const [rowSelection, setRowSelection] = React.useState({})
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false)
  const [selectedStatus, setSelectedStatus] = React.useState<CourseStatus | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Show/hide columns based on screen size
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setColumnVisibility({
          updatedAt: false,
          price: false,
          duration: false,
        })
      } else if (window.innerWidth < 1024) {
        setColumnVisibility({
          updatedAt: false,
          price: false,
        })
      } else {
        setColumnVisibility({})
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const columns: ColumnDef<AdminCourseType>[] = [
    {
      id: "select",
      enableHiding: false,
      size: 44,
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
      accessorKey: "title",
      size: 280,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Tiêu đề
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return (
          <div className="min-w-0 max-w-[320px]">
            <Link
              href={`/admin/courses/${row.original.id}/edit`}
              className="font-medium hover:underline hover:text-primary transition-colors"
            >
              {row.getValue("title")}
            </Link>
            {row.original.smallDescription && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                {row.original.smallDescription}
              </p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Trạng thái
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as CourseStatus
        return (
          <Badge
            variant="outline"
            className={statusColors[status]}
          >
            {statusLabels[status] ?? status}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      size: 120,
    },
    {
      accessorKey: "level",
      header: "Trình độ",
      cell: ({ row }) => {
        const level = row.getValue("level") as string
        return (
          <Badge
            variant="outline"
            className={levelColors[level] || ""}
          >
            {levelLabels[level] ?? level}
          </Badge>
        )
      },
      size: 120,
    },
    {
      accessorKey: "duration",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3 w-full justify-end"
        >
          Thời lượng
          <ArrowUpDownIcon className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-sm text-center tabular-nums whitespace-nowrap w-full">
            {row.getValue("duration")} giờ
          </div>
        )
      },
      size: 100,
    },
    {
      id: "enrollments",
      accessorFn: (row) => row._count?.enrollments ?? 0,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3 w-full justify-center"
          >
            Số học viên
            <ArrowUpDownIcon className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const count = row.original._count?.enrollments ?? 0
        return (
          <div className="text-sm tabular-nums text-center w-full">
            {count}
          </div>
        )
      },
      size: 50,
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3 w-full justify-end"
          >
            Giá
            <ArrowUpDownIcon className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"))
        return (
          <div className="text-sm font-medium text-right tabular-nums whitespace-nowrap">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(price)}
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3 w-full justify-end"
          >
            Ngày tạo
            <ArrowUpDownIcon className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return (
          <div className="text-sm text-muted-foreground text-center whitespace-nowrap">
            {formatDate(date)}
          </div>
        )
      },
      size: 110,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3 w-full justify-end"
          >
            Cập nhật
            <ArrowUpDownIcon className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("updatedAt"))
        return (
          <div className="text-sm text-muted-foreground">
            {formatDate(date)}
          </div>
        )
      },
      size: 110,
    },
    {
      id: "actions",
      enableHiding: false,
      size: 64,
      cell: ({ row }) => {
        const course = row.original

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
                <Link href={`/admin/courses/${course.id}/edit`}>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Chỉnh sửa Khóa học
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/courses/${course.slug}`}>
                  <EyeIcon className="mr-2 h-4 w-4" />
                  Xem trước Khóa học
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => router.push(`/admin/courses/${course.id}/delete`)}
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                Xóa Khóa học
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: courses,
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
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const statusFilter = (table.getColumn("status")?.getFilterValue() as string[]) || []

  const handleBulkDelete = () => {
    const courseIds = selectedRows.map((row) => row.original.id)
    startTransition(async () => {
      const { data: response, error } = await tryCatch(BulkDeleteCourses(courseIds))

      if (error) {
        toast.error(error.message)
        return
      }

      if (response?.status === "success") {
        toast.success(response.message)
        setRowSelection({})
        setDeleteDialogOpen(false)
        router.refresh()
      } else if (response?.status === "error") {
        toast.error(response.message)
      }
    })
  }

  const handleBulkStatusUpdate = (status: CourseStatus) => {
    const courseIds = selectedRows.map((row) => row.original.id)
    startTransition(async () => {
      const { data: response, error } = await tryCatch(
        BulkUpdateCourseStatus(courseIds, status)
      )

      if (error) {
        toast.error(error.message)
        return
      }

      if (response?.status === "success") {
        toast.success(response.message)
        setRowSelection({})
        setStatusDialogOpen(false)
        setSelectedStatus(null)
        router.refresh()
      } else if (response?.status === "error") {
        toast.error(response.message)
      }
    })
  }

  return (
    <div className="w-full space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm khóa học..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("title")?.setFilterValue(event.target.value)
              }
              className="pl-8"
            />
          </div>
          <Select
            value={statusFilter.length > 0 ? statusFilter[0] : "all"}
            onValueChange={(value) => {
              if (value === "all") {
                table.getColumn("status")?.setFilterValue(undefined)
              } else {
                table.getColumn("status")?.setFilterValue([value])
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Published">Đã xuất bản</SelectItem>
              <SelectItem value="Draft">Bản nháp</SelectItem>
              <SelectItem value="Archived">Đã lưu trữ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedRows.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">
              {selectedRows.length} đã chọn
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isPending}>
                  Đổi Trạng thái
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedStatus("Published")
                    setStatusDialogOpen(true)
                  }}
                >
                  Đặt thành Đã xuất bản
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedStatus("Draft")
                    setStatusDialogOpen(true)
                  }}
                >
                  Đặt thành Bản nháp
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedStatus("Archived")
                    setStatusDialogOpen(true)
                  }}
                >
                  Đặt thành Đã lưu trữ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isPending}
            >
              <Trash2Icon className="mr-2 h-4 w-4" />
              Xóa đã chọn
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ minWidth: header.getSize() }}
                    className="align-middle"
                  >
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
                  {row.getVisibleCells().map((cell) => {
                    const isNumeric =
                      cell.column.id === "duration" ||
                      cell.column.id === "enrollments" ||
                      cell.column.id === "price" ||
                      cell.column.id === "createdAt" ||
                      cell.column.id === "updatedAt"
                    const isTitle = cell.column.id === "title"
                    return (
                      <TableCell
                        key={cell.id}
                        style={{ minWidth: cell.column.getSize(), ...(isTitle ? { maxWidth: cell.column.getSize() } : {}) }}
                        className={`align-middle ${isNumeric ? "text-right" : ""} ${isTitle ? "overflow-hidden" : ""}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không tìm thấy khóa học nào.
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
          {table.getFilteredRowModel().rows.length} khóa học
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
                table.setPageSize(Number(value))
              }}
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Sẽ xóa vĩnh viễn{" "}
              <strong>{selectedRows.length}</strong> khóa học.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Status Update Confirmation Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cập nhật Trạng thái Khóa học</AlertDialogTitle>
            <AlertDialogDescription>
              Sẽ thay đổi trạng thái của <strong>{selectedRows.length}</strong>{" "}
              khóa học thành <strong>{selectedStatus ? statusLabels[selectedStatus] : selectedStatus}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isPending}
              onClick={() => {
                setSelectedStatus(null)
              }}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedStatus && handleBulkStatusUpdate(selectedStatus)}
              disabled={isPending || !selectedStatus}
            >
              {isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Cập nhật
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
