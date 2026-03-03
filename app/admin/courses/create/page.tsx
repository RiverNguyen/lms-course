import CourseCreateForm from "@/app/admin/courses/create/_components/course-create-form";
import { getAllCategories } from "@/app/data/category/get-all-categories";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

const CourseCreatePage = async () => {
  const categories = await getAllCategories();

  return (
    <>
      <div className="flex items-center gap-2">
        <Link
          href="/admin/courses"
          className={buttonVariants({
            variant: "outline",
            size: "icon",
          })}
        >
          <ArrowLeftIcon className="size-4" />
        </Link>
        <h1 className="text-2xl font-bold">Tạo khóa học mới</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>
            Nhập thông tin cơ bản về khóa học
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseCreateForm categories={categories} />
        </CardContent>
      </Card>
    </>
  );
};

export default CourseCreatePage;
