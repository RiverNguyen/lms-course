"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { tryCatch } from "@/hooks/try-catch";
import Link from "next/link";
import { useTransition } from "react";
import { DeleteCategory } from "@/app/admin/categories/[categoryId]/delete/action";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";

export default function DeleteCategoryRoute() {
  const [isPending, startTransition] = useTransition();
  const { categoryId } = useParams<{ categoryId: string }>();
  const router = useRouter();

  const onSubmit = () => {
    startTransition(async () => {
      const { data: response, error } = await tryCatch(
        DeleteCategory(categoryId)
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      if (response.status === "success") {
        toast.success(response.message);
        router.push("/admin/categories");
      } else if (response.status === "error") {
        toast.error(response.message);
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto w-full">
      <Card className="mt-32">
        <CardHeader>
          <CardTitle>Are you sure you want to delete this category?</CardTitle>
          <CardDescription>
            This action cannot be undone. Courses associated with this category
            will have their category set to null.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={"/admin/categories"}
          >
            Cancel
          </Link>

          <Button
            variant="destructive"
            onClick={onSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Delete Category"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
