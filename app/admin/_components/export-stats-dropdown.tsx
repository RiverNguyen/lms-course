"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet } from "lucide-react";
import { useState } from "react";

type TimeRange = "7d" | "30d" | "90d" | "1y";
type ExportType =
  | "signups"
  | "enrollments"
  | "revenue"
  | "course-status"
  | "course-level"
  | "enrollment-status"
  | "courses-by-category";

const TIME_LABELS: Record<TimeRange, string> = {
  "7d": "7 ngày qua",
  "30d": "30 ngày qua",
  "90d": "90 ngày qua",
  "1y": "1 năm qua",
};

async function downloadExport(type: ExportType, range?: TimeRange) {
  const params = new URLSearchParams({ type });
  if (range) params.set("range", range);
  const url = `/api/admin/export-stats?${params.toString()}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Xuất file thất bại");
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="(.+)"/);
  const filename = match?.[1] ?? `thong-ke-${type}-${Date.now()}.csv`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function ExportStatsDropdown() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (type: ExportType, range?: TimeRange) => {
    const key = range ? `${type}-${range}` : type;
    setLoading(key);
    try {
      await downloadExport(type, range);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Xuất file thất bại");
    } finally {
      setLoading(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={!!loading}>
          <FileSpreadsheet className="size-4" />
          {loading ? "Đang xuất…" : "Xuất thống kê"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Xuất CSV theo thống kê</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Download className="size-4" />
            Đăng ký theo ngày
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {(Object.entries(TIME_LABELS) as [TimeRange, string][]).map(
              ([range, label]) => (
                <DropdownMenuItem
                  key={range}
                  onClick={() => handleExport("signups", range)}
                  disabled={loading !== null}
                >
                  {label}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Download className="size-4" />
            Ghi danh theo ngày
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {(Object.entries(TIME_LABELS) as [TimeRange, string][]).map(
              ([range, label]) => (
                <DropdownMenuItem
                  key={range}
                  onClick={() => handleExport("enrollments", range)}
                  disabled={loading !== null}
                >
                  {label}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Download className="size-4" />
            Doanh thu theo ngày
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {(Object.entries(TIME_LABELS) as [TimeRange, string][]).map(
              ([range, label]) => (
                <DropdownMenuItem
                  key={range}
                  onClick={() => handleExport("revenue", range)}
                  disabled={loading !== null}
                >
                  {label}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport("course-status")}
          disabled={loading !== null}
        >
          <Download className="size-4" />
          Trạng thái khóa học
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("course-level")}
          disabled={loading !== null}
        >
          <Download className="size-4" />
          Cấp độ khóa học
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("enrollment-status")}
          disabled={loading !== null}
        >
          <Download className="size-4" />
          Trạng thái ghi danh
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("courses-by-category")}
          disabled={loading !== null}
        >
          <Download className="size-4" />
          Khóa học theo danh mục
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
