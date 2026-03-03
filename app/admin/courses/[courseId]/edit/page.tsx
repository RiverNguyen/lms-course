import CourseStructure from "@/app/admin/courses/[courseId]/edit/_components/course-structure";
import EditCourseForm from "@/app/admin/courses/[courseId]/edit/_components/edit-course-form";
import { adminGetCourse } from "@/app/data/admin/admin-get-course";
import { getAllCategories } from "@/app/data/category/get-all-categories";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/ui/animate-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Params = Promise<{ courseId: string }>;

const EditCoursePage = async ({ params }: { params: Params }) => {
  const { courseId } = await params;
  const [data, categories] = await Promise.all([
    adminGetCourse(courseId),
    getAllCategories(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Chỉnh sửa Khóa học:{" "}
        <span className="text-primary underline">{data?.title}</span>
      </h1>

      <Tabs defaultValue="basic-info">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="basic-info">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="course-structure">Cấu trúc Khóa học</TabsTrigger>
        </TabsList>

        <TabsContents>
          <TabsContent value="basic-info">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
                <CardDescription>
                  Nhập thông tin cơ bản về khóa học
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EditCourseForm data={data} categories={categories} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="course-structure">
            <Card>
              <CardHeader>
                <CardTitle>Cấu trúc Khóa học</CardTitle>
                <CardDescription>
                  Quản lý cấu trúc khóa học (chương và bài học)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CourseStructure data={data} />
              </CardContent>
            </Card>
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
};

export default EditCoursePage;
