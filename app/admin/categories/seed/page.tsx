"use client";

import { SeedCategories } from "../seed-categories";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { tryCatch } from "@/hooks/try-catch";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export default function SeedCategoriesPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSeed = () => {
    startTransition(async () => {
      const { data: response, error } = await tryCatch(SeedCategories());

      if (error) {
        toast.error(error.message);
        return;
      }

      if (response?.status === "success") {
        toast.success(response.message);
        router.push("/admin/categories");
        router.refresh();
      } else if (response?.status === "error") {
        toast.error(response.message);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" />
            Tạo Danh mục Mẫu
          </CardTitle>
          <CardDescription>
            Sẽ tạo 10 danh mục mẫu cho LMS của bạn. Các danh mục đã tồn tại sẽ được bỏ qua.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Các danh mục sẽ được tạo:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Information Technology</li>
              <li>Web Development</li>
              <li>Data Science</li>
              <li>Mobile Development</li>
              <li>Design & UI/UX</li>
              <li>Business & Finance</li>
              <li>Digital Marketing</li>
              <li>Photography & Video</li>
              <li>Language Learning</li>
              <li>Personal Development</li>
            </ul>
          </div>

          <Button
            onClick={handleSeed}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo Danh mục...
              </>
            ) : (
              <>
                <SparklesIcon className="mr-2 h-4 w-4" />
                Tạo 10 Danh mục Mẫu
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
