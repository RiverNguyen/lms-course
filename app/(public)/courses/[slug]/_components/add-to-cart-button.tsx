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
  const { isEnrolled } = useCheckEnrollment(courseId);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (isEnrolled) {
      toast.info("You already own this course");
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
      toast.success("Course added to cart!");
    } catch (error) {
      toast.error("An error occurred while adding to cart");
    } finally {
      setIsAdding(false);
    }
  };

  if (isEnrolled) {
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
      {isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  );
};
