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
import { DeleteCourse } from "@/app/admin/courses/[courseId]/delete/action";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";

export default function DeleteCourseRoute() {
  const [isPending, startTransition] = useTransition();
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  const onSubmit = () => {
    startTransition(async () => {
      const { data: response, error } = await tryCatch(DeleteCourse(courseId));

      if (error) {
        toast.error(error.message);
        return;
      }

      if (response.status === "success") {
        toast.success(response.message);
        router.push("/admin/courses");
      } else if (response.status === "error") {
        toast.error(response.message);
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto w-full">
      <Card className="mt-32">
        <CardHeader>
          <CardTitle>Bạn có chắc chắn muốn xóa khóa học này?</CardTitle>
          <CardDescription>Hành động này không thể hoàn tác.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={"/admin/courses"}
          >
            Hủy
          </Link>

          <Button variant="destructive" onClick={onSubmit} disabled={isPending}>
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Xóa Khóa học"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
