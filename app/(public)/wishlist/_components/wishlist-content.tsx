"use client";

import {
  getCourseImageUrl,
  COURSE_PLACEHOLDER_IMAGE,
} from "@/hooks/use-construct-url";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { toggleWishlistAction } from "../actions";
import type { WishlistCourseItem } from "@/app/data/wishlist/get-wishlist-courses";
import { useCheckEnrollment } from "@/hooks/use-check-enrollment";

interface WishlistContentProps {
  initialCourses: WishlistCourseItem[];
}

export function WishlistContent({ initialCourses }: WishlistContentProps) {
  const [courses, setCourses] = useState(initialCourses);
  const addItem = useCartStore((state) => state.addItem);

  const handleRemove = async (courseId: string) => {
    const result = await toggleWishlistAction(courseId);
    if (result.success && !result.inWishlist) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    }
  };

  if (courses.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">
          Danh sách yêu thích trống
        </h2>
        <p className="text-muted-foreground mb-6">
          Thêm các khóa học bạn quan tâm bằng nút trái tim trên thẻ khóa học
        </p>
        <Link href="/courses">
          <Button>Khám phá Khóa học</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        const imageUrl = getCourseImageUrl(course.fileKey);
        const isFree =
          course.price === "0" || parseFloat(course.price) === 0;
        return (
          <WishlistCourseCard
            key={course.id}
            course={course}
            imageUrl={imageUrl}
            isFree={isFree}
            onRemove={handleRemove}
            onAddToCart={() => {
              if (isFree) {
                toast.info("Khóa học miễn phí không cần thêm vào giỏ hàng");
                return;
              }
              addItem({
                id: course.id,
                title: course.title,
                slug: course.slug,
                price: course.price,
                fileKey: course.fileKey,
              });
              toast.success("Đã thêm vào giỏ hàng!");
            }}
          />
        );
      })}
    </div>
  );
}

function WishlistCourseCard({
  course,
  imageUrl,
  isFree,
  onRemove,
  onAddToCart,
}: {
  course: WishlistCourseItem;
  imageUrl: string;
  isFree: boolean;
  onRemove: (courseId: string) => void;
  onAddToCart: () => void;
}) {
  const { isEnrolled, isLoading } = useCheckEnrollment(course.id);
  const [removing, setRemoving] = useState(false);
  const [imgSrc, setImgSrc] = useState(imageUrl);
  useEffect(() => {
    setImgSrc(imageUrl);
  }, [imageUrl]);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    await onRemove(course.id);
    setRemoving(false);
  };

  return (
    <Card className="group relative overflow-hidden p-0">
      <Link href={`/courses/${course.slug}`}>
        <div className="relative aspect-video w-full bg-muted">
          <Image
            src={imgSrc}
            alt={course.title}
            fill
            className="object-cover"
            onError={() => setImgSrc(COURSE_PLACEHOLDER_IMAGE)}
          />
          <div className="absolute top-2 right-2 z-10">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-full bg-background/80 shadow hover:bg-background"
              onClick={handleRemove}
              disabled={removing}
              aria-label="Xóa khỏi wishlist"
            >
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {course.smallDescription}
          </p>
          <p className="text-lg font-bold text-primary mt-2">
            {isFree
              ? "Miễn phí"
              : new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(Number(course.price))}
          </p>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              asChild
            >
              <Link href={`/courses/${course.slug}`}>
                Xem chi tiết <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
            {!isEnrolled && !isFree && !isLoading && (
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToCart();
                }}
              >
                <ShoppingCart className="size-4 mr-1" />
                Thêm vào giỏ
              </Button>
            )}
            {isEnrolled && (
              <Link href={`/dashboard/${course.slug}`}>
                <Button size="sm" className="flex-1">
                  Vào khóa học
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
