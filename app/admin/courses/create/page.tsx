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
        <h1 className="text-2xl font-bold">Create a new course</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Provide basic information about the course
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
