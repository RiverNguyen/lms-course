"use client";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  getCourseImageUrl,
  COURSE_PLACEHOLDER_IMAGE,
} from "@/hooks/use-construct-url";
import Image from "next/image";
import { Trash2, ShoppingCart, Tag, X } from "lucide-react";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { checkoutCartAction, validateCouponAction, type AppliedCoupon } from "./actions";
import { Loader2 } from "lucide-react";
import { useCheckMultipleEnrollments } from "@/hooks/use-check-enrollment";
import { useEffect } from "react";

export default function CartPage() {
  const [isPending, startTransition] = useTransition();
  const [couponCode, setCouponCode] = useState("");
  const [applyCouponPending, setApplyCouponPending] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
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

  // Remove enrolled courses from cart (only once when enrollment data is loaded)
  useEffect(() => {
    if (!isLoading && courseIds.length > 0) {
      const enrolledItems = items.filter((item) => enrolledMap[item.id]);
      if (enrolledItems.length > 0) {
        enrolledItems.forEach((item) => {
          removeItem(item.id);
          toast.info(`Đã xóa "${item.title}" - bạn đã sở hữu khóa học này`);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleApplyCoupon = async () => {
    const subtotal = getSubtotal();
    if (subtotal <= 0) {
      toast.error("Giỏ hàng trống, không thể áp dụng mã");
      return;
    }
    if (!couponCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }
    setApplyCouponPending(true);
    const result = await validateCouponAction(couponCode.trim(), subtotal);
    setApplyCouponPending(false);
    if (result.status === "success") {
      setAppliedCoupon({
        couponId: result.couponId,
        discountAmount: result.discountAmount,
        stripeCouponId: result.stripeCouponId,
        code: result.code,
      });
      toast.success(result.message);
    } else {
      toast.error(result.message);
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống");
      return;
    }

    startTransition(async () => {
      const subtotal = getSubtotal();
      const totalBeforeDiscount = getTotal();
      const total = appliedCoupon
        ? Math.max(0, totalBeforeDiscount - appliedCoupon.discountAmount)
        : totalBeforeDiscount;

      const result = await checkoutCartAction(
        items,
        subtotal,
        total,
        appliedCoupon
      );

      if (result?.status === "error") {
        toast.error(result.message || "Đã xảy ra lỗi trong quá trình thanh toán");
      }
    });
  };

  const subtotal = getSubtotal();
  const totalBeforeDiscount = getTotal();
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, totalBeforeDiscount - discountAmount);

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Giỏ hàng của bạn</h1>
        <p className="text-muted-foreground">
          {getTotalItems()} {getTotalItems() === 1 ? "sản phẩm" : "sản phẩm"} trong giỏ hàng
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Giỏ hàng của bạn đang trống</h2>
          <p className="text-muted-foreground mb-6">
            Thêm các khóa học bạn muốn vào giỏ hàng
          </p>
          <Link href="/courses">
            <Button>Khám phá Khóa học</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const itemPrice = parseFloat(item.price);
              const imageUrl = imgErrors[item.id]
                ? COURSE_PLACEHOLDER_IMAGE
                : getCourseImageUrl(item.fileKey);

              return (
                <Card key={item.id} className="overflow-hidden p-0">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Course Image */}
                      <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0 bg-muted">
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
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <Link href={`/courses/${item.slug}`}>
                            <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors cursor-pointer">
                              {item.title}
                            </h3>
                          </Link>
                          <p className="text-2xl font-bold text-primary mb-4">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(itemPrice)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <div className="flex items-center justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary & Checkout */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt Đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                  {/* Coupon */}
                  <div className="space-y-2">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
                        <span className="flex items-center gap-2">
                          <Tag className="size-4 text-primary" />
                          Mã: <strong>{appliedCoupon.code}</strong> (-{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(appliedCoupon.discountAmount)})
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={handleRemoveCoupon}
                          aria-label="Xóa mã giảm giá"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Mã giảm giá"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="flex-1"
                          disabled={applyCouponPending}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={applyCouponPending || !couponCode.trim()}
                        >
                          {applyCouponPending ? <Loader2 className="size-4 animate-spin" /> : "Áp dụng"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá</span>
                      <span>-{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(discountAmount)}</span>
                    </div>
                  )}
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
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Card>
              <CardContent className="pt-6">
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
                    "Tiến hành Thanh toán với Stripe"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Thanh toán an toàn qua Stripe. Bạn sẽ được chuyển hướng đến trang thanh toán.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
