"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toggleWishlistAction } from "@/app/(public)/wishlist/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  courseId: string;
  initialInWishlist?: boolean;
  /** For card: absolute top-right. For inline: normal button. */
  variant?: "icon-on-card" | "icon";
  className?: string;
}

export function WishlistButton({
  courseId,
  initialInWishlist = false,
  variant = "icon",
  className,
}: WishlistButtonProps) {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user) {
      toast.info("Vui lòng đăng nhập để lưu khóa học vào danh sách yêu thích.");
      return;
    }
    setIsPending(true);
    const result = await toggleWishlistAction(courseId);
    setIsPending(false);
    if (result.success) {
      setInWishlist(result.inWishlist);
      toast.success(
        result.inWishlist
          ? "Đã thêm vào danh sách yêu thích!"
          : "Đã xóa khỏi danh sách yêu thích."
      );
    } else {
      toast.error(result.error ?? "Có lỗi xảy ra.");
    }
  };

  if (isSessionPending) return null;
  if (!session?.user) return null;

  const label = inWishlist ? "Xóa khỏi wishlist" : "Thêm vào wishlist";

  const button = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={label}
      className={cn(
        variant === "icon-on-card" &&
          "absolute top-2 left-2 z-[10] h-8 w-8 rounded-full bg-background/80 shadow hover:bg-background/90",
        variant === "icon" && "h-8 w-8",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4",
          inWishlist && "fill-red-500 text-red-500"
        )}
      />
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
