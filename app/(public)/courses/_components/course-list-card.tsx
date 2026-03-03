"use client";

import { FilteredCourseType } from "@/app/data/course/get-filtered-courses";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useConstructUrl } from "@/hooks/use-construct-url";
import {
  BookOpen,
  Clock,
  GraduationCap,
  BarChart3,
  ArrowRight,
  ShoppingCart,
  BookOpenIcon,
} from "lucide-react";
import { WishlistButton } from "@/app/(public)/_components/wishlist-button";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCheckEnrollment } from "@/hooks/use-check-enrollment";

interface CourseListCardProps {
  data: FilteredCourseType;
  initialInWishlist?: boolean;
}

const levelLabels: Record<string, string> = {
  Beginner: "Người mới bắt đầu",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
};

const CourseListCard = ({ data, initialInWishlist = false }: CourseListCardProps) => {
  const thumbnailUrl = useConstructUrl(data?.fileKey);
  const addItem = useCartStore((state) => state.addItem);
  const { isEnrolled, isLoading } = useCheckEnrollment(data.id);
  const lessonCount = data.chapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0
  );
  const studentCount = data._count.enrollments;
  const isFree = data.price === "0" || parseFloat(data.price) === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFree) {
      toast.info("Khóa học miễn phí không cần thêm vào giỏ hàng");
      return;
    }

    if (isEnrolled) {
      toast.info("Bạn đã sở hữu khóa học này");
      return;
    }

    addItem({
      id: data.id,
      title: data.title,
      slug: data.slug,
      price: data.price,
      fileKey: data.fileKey,
    });
    toast.success("Đã thêm khóa học vào giỏ hàng!");
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer p-0">
      <div className="flex flex-col md:flex-row">
        {/* Course Image */}
        <div className="relative w-full md:w-64 lg:w-80 h-48 md:h-auto flex-shrink-0">
          <Badge className="absolute top-2 left-2 z-10">
            {data?.category?.name || "Chưa phân loại"}
          </Badge>
          <WishlistButton
            courseId={data.id}
            initialInWishlist={initialInWishlist}
            variant="icon-on-card"
            className="absolute top-2 right-2 left-auto z-10"
          />
          <Image
            src={thumbnailUrl}
            alt={data?.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Course Content */}
        <CardContent className="flex-1 p-6 flex flex-col justify-between">
          <div>
            {/* Instructor */}
            <p className="text-sm text-muted-foreground mb-2">
              bởi {data?.user?.name || "Giảng viên chưa xác định"}
            </p>

            {/* Course Title */}
            <Link
              href={`/courses/${data?.slug}`}
              className="font-semibold text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-200"
            >
              {data?.title}
            </Link>

            {/* Course Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="size-4" />
                <span>{data?.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4" />
                <span>{studentCount} Học viên</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4" />
                <span>{levelLabels[data?.level] || data?.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="size-4" />
                <span>{lessonCount} Bài học</span>
              </div>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {isFree ? (
                  <span className="text-green-600">Miễn phí</span>
                ) : (
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(data.price))
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isEnrolled ? (
                <Link
                  href={`/dashboard/${data?.slug}`}
                  className={buttonVariants({
                    className: "whitespace-nowrap",
                  })}
                >
                  <BookOpenIcon className="size-4 mr-2" />
                  Vào khóa học
                </Link>
              ) : !isFree && !isLoading ? (
                <Button
                  variant="default"
                  onClick={handleAddToCart}
                  className="whitespace-nowrap"
                >
                  <ShoppingCart className="size-4 mr-2" />
                  Thêm vào giỏ
                </Button>
              ) : null}
              <Link
                href={`/courses/${data?.slug}`}
                className={buttonVariants({
                  variant: "outline",
                  className: "group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200 whitespace-nowrap",
                })}
              >
                Xem thêm <ArrowRight className="size-4 ml-2" />
              </Link>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default CourseListCard;
