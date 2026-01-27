"use client";

import { AllCoursesType } from "@/app/data/course/get-all-courses";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { ArrowRightIcon, SchoolIcon, TimerIcon, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCheckEnrollment } from "@/hooks/use-check-enrollment";

interface PublicCourseCardProps {
  data: AllCoursesType;
}

const PublicCourseCard = ({ data }: PublicCourseCardProps) => {
  const thumbnailUrl = useConstructUrl(data?.fileKey);
  const addItem = useCartStore((state) => state.addItem);
  const { isEnrolled } = useCheckEnrollment(data.id);
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
    <Card className="group relative py-0 gap-0">
      <Badge className="absolute top-2 right-2 z-[10]">{data?.level}</Badge>
      <Image
        src={thumbnailUrl}
        alt={data?.title}
        width={600}
        height={400}
        className="w-full rounded-t-xl aspect-video h-[250px] object-cover"
      />

      <CardContent className="p-4">
        <Link
          href={`/courses/${data?.slug}`}
          className="font-medium w-fit text-lg line-clamp-2 group-hover:underline group-hover:text-primary transition-colors duration-300"
        >
          {data?.title}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground leading-tight mt-2">
          {data?.smallDescription}
        </p>
        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-ceter gap-x-2">
            <TimerIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <p className="text-sm text-muted-foreground">
              {data?.duration} hours
            </p>
          </div>
          <div className="flex items-ceter gap-x-2">
            <SchoolIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <p className="text-sm text-muted-foreground">
              {data?.category?.name || "Uncategorized"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Link
            href={`/courses/${data?.slug}`}
            className={buttonVariants({ variant: "outline", className: "flex-1" })}
          >
            Learn More <ArrowRightIcon className="size-4" />
          </Link>
          {!isFree && !isEnrolled && (
            <Button
              variant="default"
              className="flex-1"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="size-4 mr-2" />
              Add to Cart
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicCourseCard;

export function PublicCourseCardSkeleton() {
  return (
    <Card className="group relative py-0 gap-0">
      <div className="absolute top-2 right-2 z-[10]">
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="w-full relative h-fit">
        <Skeleton className="w-full rounded-t-xl aspect-video h-[250px] object-cover" />
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 rounded-md mb-2" />
        <Skeleton className="h-4 w-full rounded-md mb-1" />
        <Skeleton className="h-4 w-5/6 rounded-md mb-4" />
        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
          <div className="flex items-center gap-x-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-md mt-4" />
      </CardContent>
    </Card>
  );
}
