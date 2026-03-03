"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useCheckEnrollment } from "@/hooks/use-check-enrollment";

interface AddToCartButtonProps {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  coursePrice: string;
  courseFileKey: string;
}

export const AddToCartButton = ({
  courseId,
  courseTitle,
  courseSlug,
  coursePrice,
  courseFileKey,
}: AddToCartButtonProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const { isEnrolled, isLoading } = useCheckEnrollment(courseId);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (isEnrolled) {
      toast.info("Bạn đã sở hữu khóa học này");
      return;
    }

    setIsAdding(true);
    try {
      addItem({
        id: courseId,
        title: courseTitle,
        slug: courseSlug,
        price: coursePrice,
        fileKey: courseFileKey,
      });
      toast.success("Đã thêm khóa học vào giỏ hàng!");
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi thêm vào giỏ hàng");
    } finally {
      setIsAdding(false);
    }
  };

  if (isEnrolled || isLoading) {
    return null;
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleAddToCart}
      disabled={isAdding}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {isAdding ? "Đang thêm..." : "Thêm vào Giỏ hàng"}
    </Button>
  );
};
