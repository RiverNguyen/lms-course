import {
  adminGetUserSignupsData,
  adminGetEnrollmentsData,
  adminGetRevenueData,
  adminGetCourseStatusData,
  adminGetCourseLevelData,
  adminGetEnrollmentStatusData,
  adminGetCoursesByCategoryData,
} from "@/app/data/admin/admin-get-chart-data";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type TimeRange = "7d" | "30d" | "90d" | "1y";
type ExportType =
  | "signups"
  | "enrollments"
  | "revenue"
  | "course-status"
  | "course-level"
  | "enrollment-status"
  | "courses-by-category";

function toCSV<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const headerRow = headers.map(escape).join(",");
  const dataRows = rows.map((row) =>
    headers.map((h) => escape(row[h])).join(",")
  );
  return [headerRow, ...dataRows].join("\r\n");
}

function getFilename(type: ExportType, range?: TimeRange): string {
  const date = new Date().toISOString().slice(0, 10);
  const names: Record<ExportType, string> = {
    signups: "dang-ky-theo-ngay",
    enrollments: "ghi-danh-theo-ngay",
    revenue: "doanh-thu-theo-ngay",
    "course-status": "trang-thai-khoa-hoc",
    "course-level": "cap-do-khoa-hoc",
    "enrollment-status": "trang-thai-ghi-danh",
    "courses-by-category": "khoa-hoc-theo-danh-muc",
  };
  const base = names[type];
  return range ? `${base}-${range}-${date}.csv` : `${base}-${date}.csv`;
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") ?? "signups") as ExportType;
  const range = (searchParams.get("range") ?? "90d") as TimeRange;

  const validTypes: ExportType[] = [
    "signups",
    "enrollments",
    "revenue",
    "course-status",
    "course-level",
    "enrollment-status",
    "courses-by-category",
  ];
  const validRanges: TimeRange[] = ["7d", "30d", "90d", "1y"];

  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (
    ["signups", "enrollments", "revenue"].includes(type) &&
    !validRanges.includes(range)
  ) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  try {
    let csv = "";
    let filename = "";

    switch (type) {
      case "signups": {
        const data = await adminGetUserSignupsData(range);
        csv = toCSV(data);
        filename = getFilename(type, range);
        break;
      }
      case "enrollments": {
        const data = await adminGetEnrollmentsData(range);
        csv = toCSV(data);
        filename = getFilename(type, range);
        break;
      }
      case "revenue": {
        const data = await adminGetRevenueData(range);
        csv = toCSV(data);
        filename = getFilename(type, range);
        break;
      }
      case "course-status": {
        const data = await adminGetCourseStatusData();
        csv = toCSV(data);
        filename = getFilename(type);
        break;
      }
      case "course-level": {
        const data = await adminGetCourseLevelData();
        csv = toCSV(data);
        filename = getFilename(type);
        break;
      }
      case "enrollment-status": {
        const data = await adminGetEnrollmentStatusData();
        csv = toCSV(data);
        filename = getFilename(type);
        break;
      }
      case "courses-by-category": {
        const data = await adminGetCoursesByCategoryData();
        csv = toCSV(data);
        filename = getFilename(type);
        break;
      }
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[export-stats]", error);
    return NextResponse.json(
      { error: "Failed to export statistics" },
      { status: 500 }
    );
  }
}
