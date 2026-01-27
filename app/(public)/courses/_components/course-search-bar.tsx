"use client";

import { Input } from "@/components/ui/input";
import { Search, Grid3x3, List } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface CourseSearchBarProps {
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
}

const CourseSearchBar = ({
  viewMode = "list",
  onViewModeChange,
}: CourseSearchBarProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("search", search);
        params.set("page", "1"); // Reset to first page on search
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params.toString()}`);
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [search, searchParams, router, pathname]);

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex items-center gap-2 border rounded-md p-1">
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange?.("list")}
          className="h-8 w-8 p-0"
        >
          <List className="size-4" />
        </Button>
        <Button
          variant={viewMode === "grid" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange?.("grid")}
          className="h-8 w-8 p-0"
        >
          <Grid3x3 className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default CourseSearchBar;
