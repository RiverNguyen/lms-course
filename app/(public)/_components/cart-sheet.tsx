"use client";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  getCourseImageUrl,
  COURSE_PLACEHOLDER_IMAGE,
} from "@/hooks/use-construct-url";
import Image from "next/image";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { checkoutCartAction } from "@/app/(public)/cart/actions";
import { Loader2 } from "lucide-react";
import { useCheckMultipleEnrollments } from "@/hooks/use-check-enrollment";
import { useEffect } from "react";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartSheet = ({ open, onOpenChange }: CartSheetProps) => {
  const [isPending, startTransition] = useTransition();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const {
    items,
    removeItem,
    getSubtotal,
    getTotal,
    getTotalItems,
  } = useCartStore();

  const courseIds = items.map((item) => item.id);
  const { enrolledMap, isLoading } = useCheckMultipleEnrollments(courseIds);

  // Remove enrolled courses from cart when sheet opens (only once when enrollment data is loaded)
  useEffect(() => {
    if (open && !isLoading && courseIds.length > 0) {
      const enrolledItems = items.filter((item) => enrolledMap[item.id]);
      if (enrolledItems.length > 0) {
        enrolledItems.forEach((item) => {
          removeItem(item.id);
          toast.info(`Đã xóa "${item.title}" - bạn đã sở hữu khóa học này`);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isLoading]);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống");
      return;
    }

    startTransition(async () => {
      const subtotal = getSubtotal();
      const total = getTotal();

      const result = await checkoutCartAction(
        items,
        subtotal,
        total
      );

      if (result?.status === "error") {
        toast.error(result.message || "Đã xảy ra lỗi trong quá trình thanh toán");
      } else {
        onOpenChange(false);
      }
    });
  };

  const subtotal = getSubtotal();
  const total = getTotal();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle>Giỏ hàng của bạn</SheetTitle>
          <SheetDescription>
            {getTotalItems()} {getTotalItems() === 1 ? "sản phẩm" : "sản phẩm"} trong giỏ hàng
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12 px-6">
            <ShoppingCart className="h-16 w-16 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Giỏ hàng của bạn đang trống</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Thêm các khóa học bạn muốn vào giỏ hàng
            </p>
            <Button onClick={() => onOpenChange(false)} asChild>
              <Link href="/courses">Khám phá Khóa học</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => {
                const itemPrice = parseFloat(item.price);
                const imageUrl = imgErrors[item.id]
                  ? COURSE_PLACEHOLDER_IMAGE
                  : getCourseImageUrl(item.fileKey);

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    {/* Course Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        onError={() =>
                          setImgErrors((prev) => ({ ...prev, [item.id]: true }))
                        }
                      />
                    </div>

                    {/* Course Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/courses/${item.slug}`}
                        onClick={() => onOpenChange(false)}
                        className="block"
                      >
                        <h4 className="font-semibold text-sm mb-1 hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                      </Link>
                      <p className="text-lg font-bold text-primary mb-2">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(itemPrice)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        <span className="text-xs">Xóa</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary & Checkout - Fixed at bottom */}
            <div className="border-t px-6 py-4 space-y-4 bg-background">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính</span>
                  <span>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(subtotal)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(total)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full"
                size="lg"
                disabled={isPending || items.length === 0}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Tiến hành Thanh toán"
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
                asChild
              >
                <Link href="/cart">
                  Xem Giỏ hàng Đầy đủ
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Thanh toán an toàn qua Stripe
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
