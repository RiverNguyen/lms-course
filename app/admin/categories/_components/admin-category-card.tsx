import { AdminCategoryType } from "@/app/data/admin/admin-get-categories";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRightIcon,
  BookOpenIcon,
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";

interface AdminCategoryCardProps {
  category: AdminCategoryType;
}

const AdminCategoryCard = ({ category }: AdminCategoryCardProps) => {
  return (
    <Card className="group relative">
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"secondary"} size={"icon"}>
              <MoreVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`/admin/categories/${category?.id}/edit`}>
                <PencilIcon className="size-4 mr-2" />
                Edit Category
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/categories/${category?.id}/delete`}>
                <Trash2Icon className="size-4 mr-2 text-destructive" />
                Delete Category
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="p-6">
        <Link
          className="font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors duration-300"
          href={`/admin/categories/${category?.id}/edit`}
        >
          {category?.name}
        </Link>

        {category?.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground leading-tight mt-2">
            {category?.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <BookOpenIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <p className="text-xsm text-muted-foreground">
              {category?._count.courses} course
              {category?._count.courses !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-muted-foreground">
            Slug: <span className="font-mono">{category?.slug}</span>
          </p>
        </div>

        <Link
          href={`/admin/categories/${category?.id}/edit`}
          className={buttonVariants({
            className: "w-full mt-4",
          })}
        >
          Edit Category <ArrowRightIcon className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
};

export default AdminCategoryCard;

export function AdminCategoryCardSkeleton() {
  return (
    <Card className="group relative">
      <div className="absolute top-2 right-2 z-[10]">
        <Skeleton className="size-8 rounded-md" />
      </div>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-3/4 rounded-md mb-2" />
        <Skeleton className="h-4 w-full rounded-md mb-1" />
        <Skeleton className="h-4 w-5/6 rounded-md mb-4" />
        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-4 w-32 rounded-md mt-4" />
        <Skeleton className="h-10 w-full rounded-md mt-4" />
      </CardContent>
    </Card>
  );
}
