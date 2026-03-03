"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { tryCatch } from "@/hooks/try-catch";
import Link from "next/link";
import { useTransition, useState, useEffect } from "react";
import { DeleteCategory } from "@/app/admin/categories/[categoryId]/delete/action";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";

export default function DeleteCategoryRoute() {
  const [isPending, startTransition] = useTransition();
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
        // Check if error is about having courses
        if (response.message.includes("khóa học")) {
          setErrorMessage(response.message);
          setErrorDialogOpen(true);
        } else {
          toast.error(response.message);
        }
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto w-full">
      <Card className="mt-32">
        <CardHeader>
          <CardTitle>Bạn có chắc chắn muốn xóa danh mục này?</CardTitle>
          <CardDescription>
            Hành động này không thể hoàn tác. Các khóa học liên kết với danh mục này
            sẽ có danh mục được đặt về null.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={"/admin/categories"}
          >
            Hủy
          </Link>

          <Button
            variant="destructive"
            onClick={onSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Xóa Danh mục"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Dialog - Category has courses */}
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Không thể xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage || "Danh mục này không thể xóa vì có khóa học liên kết."}
              <span className="block mt-2 text-destructive">
                Vui lòng xóa hết các khóa học trong danh mục này trước khi xóa danh mục.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setErrorDialogOpen(false);
              router.push("/admin/categories");
            }}>
              Quay lại
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
