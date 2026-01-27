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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCheckEnrollment } from "@/hooks/use-check-enrollment";

interface CourseListCardProps {
  data: FilteredCourseType;
}

const CourseListCard = ({ data }: CourseListCardProps) => {
  const thumbnailUrl = useConstructUrl(data?.fileKey);
  const addItem = useCartStore((state) => state.addItem);
  const { isEnrolled } = useCheckEnrollment(data.id);
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
      toast.info("Free courses don't need to be added to cart");
      return;
    }

    if (isEnrolled) {
      toast.info("You already own this course");
      return;
    }

    addItem({
      id: data.id,
      title: data.title,
      slug: data.slug,
      price: data.price,
      fileKey: data.fileKey,
    });
    toast.success("Course added to cart!");
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer p-0">
      <div className="flex flex-col md:flex-row">
        {/* Course Image */}
        <div className="relative w-full md:w-64 lg:w-80 h-48 md:h-auto flex-shrink-0">
          <Badge className="absolute top-2 left-2 z-10">
            {data?.category?.name || "Uncategorized"}
          </Badge>
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
              by {data?.user?.name || "Unknown Instructor"}
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
                <span>{studentCount} Students</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4" />
                <span>{data?.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="size-4" />
                <span>{lessonCount} Lessons</span>
              </div>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {isFree ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  `$${parseFloat(data.price).toFixed(1)}`
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isFree && !isEnrolled && (
                <Button
                  variant="default"
                  onClick={handleAddToCart}
                  className="whitespace-nowrap"
                >
                  <ShoppingCart className="size-4 mr-2" />
                  Add to Cart
                </Button>
              )}
              <Link
                href={`/courses/${data?.slug}`}
                className={buttonVariants({
                  variant: "outline",
                  className: "group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200 whitespace-nowrap",
                })}
              >
                View More <ArrowRight className="size-4 ml-2" />
              </Link>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default CourseListCard;
