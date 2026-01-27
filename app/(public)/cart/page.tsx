"use client";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Trash2, ShoppingCart } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { checkoutCartAction } from "./actions";
import { Loader2 } from "lucide-react";
import { useCheckMultipleEnrollments } from "@/hooks/use-check-enrollment";
import { useEffect } from "react";

export default function CartPage() {
  const [isPending, startTransition] = useTransition();
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
          toast.info(`Removed "${item.title}" - you already own this course`);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
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
        toast.error(result.message || "An error occurred during checkout");
      }
    });
  };

  const subtotal = getSubtotal();
  const total = getTotal();

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
        <p className="text-muted-foreground">
          {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add courses you want to your cart
          </p>
          <Link href="/courses">
            <Button>Explore Courses</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const itemPrice = parseFloat(item.price);
              const imageUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGE}.t3.storage.dev/${item.fileKey}`;

              return (
                <Card key={item.id} className="overflow-hidden p-0">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Course Image */}
                      <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0">
                        <Image
                          src={imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
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
                            ${itemPrice.toFixed(2)}
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
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
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
                      Processing...
                    </>
                  ) : (
                    "Proceed to Checkout with Stripe"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Secure payment via Stripe. You will be redirected to checkout page.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
