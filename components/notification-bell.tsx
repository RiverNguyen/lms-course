"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, BookOpen, Tag, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const POLL_INTERVAL_MS = 30_000;

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
  linkUrl: string | null;
};

type NotificationBellProps = {
  className?: string;
  variant?: "default" | "ghost";
  size?: "icon" | "default" | "sm" | "lg";
};

export function NotificationBell({
  className,
  variant = "ghost",
  size = "icon",
}: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setList(data.list ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (e) {
      console.error("fetchNotifications:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [open, fetchNotifications]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchNotifications();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    if (markingId) return;
    setMarkingId(id);
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (res.ok) {
        setList((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } finally {
      setMarkingId(null);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readAll: true }),
      });
      if (res.ok) {
        setList((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error("markAllRead:", e);
    }
  };

  const handleItemClick = (n: NotificationItem) => {
    if (!n.read) markAsRead(n.id);
    if (n.linkUrl) {
      setOpen(false);
      router.push(n.linkUrl);
    }
  };

  const iconByType = (type: string) => {
    switch (type) {
      case "NewCourse":
        return <BookOpen className="size-4 text-primary shrink-0" />;
      case "CouponExpiring":
        return <Tag className="size-4 text-amber-500 shrink-0" />;
      case "StudyReminder":
        return <Sparkles className="size-4 text-blue-500 shrink-0" />;
      default:
        return <Bell className="size-4 text-muted-foreground shrink-0" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("relative", className)}
          aria-label="Thông báo"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="font-semibold">Thông báo</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={markAllRead}
            >
              Đánh dấu đã đọc tất cả
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : list.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Chưa có thông báo
            </div>
          ) : (
            <ul className="divide-y">
              {list.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                      !n.read && "bg-primary/5"
                    )}
                    onClick={() => handleItemClick(n)}
                    disabled={markingId === n.id}
                  >
                    <div className="mt-0.5">{iconByType(n.type)}</div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-medium", !n.read && "text-foreground")}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {n.body}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
