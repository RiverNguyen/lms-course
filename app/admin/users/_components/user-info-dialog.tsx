"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminUserType } from "@/app/data/admin/admin-get-users";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  BanIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircle2Icon,
  MailIcon,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react";

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

interface UserInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserType | null;
}

export function UserInfoDialog({
  open,
  onOpenChange,
  user,
}: UserInfoDialogProps) {
  const banned = user?.banned === true;
  const [imageError, setImageError] = React.useState(false);

  // Reset lỗi ảnh khi mở dialog hoặc đổi user
  React.useEffect(() => {
    if (open && user) setImageError(false);
  }, [open, user?.id]);

  const showAvatar =
    user?.image && !imageError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thông tin người dùng</DialogTitle>
        </DialogHeader>
        {user ? (
          <div className="space-y-6">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4">
              {showAvatar ? (
                <Image
                  src={user.image!}
                  alt={user.name}
                  width={64}
                  height={64}
                  className="rounded-full border-2 border-muted object-cover"
                  unoptimized={user.image!.includes("googleusercontent.com")}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted text-2xl font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">{user.name}</h3>
                <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                  <MailIcon className="h-3.5 w-3.5 shrink-0" />
                  {user.email}
                </p>
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                  className="mt-2"
                >
                  <UserIcon className="mr-1 h-3 w-3" />
                  {user.role || "user"}
                </Badge>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Trạng thái
              </p>
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
              {banned && user.banReason && (
                <div className="rounded-md bg-muted/50 p-3 text-sm">
                  <p className="font-medium text-muted-foreground mb-1">
                    Lý do khóa
                  </p>
                  <p className="text-foreground">{user.banReason}</p>
                  {user.banExpires && (
                    <p className="text-muted-foreground text-xs mt-2">
                      Hết hạn: {formatDate(user.banExpires)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <BookOpenIcon className="h-4 w-4" />
                  Khóa học đã tạo
                </div>
                <p className="text-xl font-semibold mt-1">
                  {user._count.courses}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <ShoppingCartIcon className="h-4 w-4" />
                  Khóa học đã đăng ký
                </div>
                <p className="text-xl font-semibold mt-1">
                  {user._count.enrollments}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 shrink-0" />
                Ngày tạo: {formatDate(user.createdAt)}
              </p>
              <p className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 shrink-0" />
                Cập nhật lần cuối: {formatDate(user.updatedAt)}
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
