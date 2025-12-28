import CourseStructure from "@/app/admin/courses/[courseId]/edit/_components/course-structure";
import EditCourseForm from "@/app/admin/courses/[courseId]/edit/_components/edit-course-form";
import { adminGetCourse } from "@/app/data/admin/admin-get-course";
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
  const data = await adminGetCourse(courseId);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Edit Course:{" "}
        <span className="text-primary underline">{data?.title}</span>
      </h1>

      <Tabs defaultValue="basic-info">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="course-structure">Course Structure</TabsTrigger>
        </TabsList>

        <TabsContents>
          <TabsContent value="basic-info">
            <Card>
              <CardHeader>
                <CardTitle>Basic Info</CardTitle>
                <CardDescription>
                  Provide basic information about the course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EditCourseForm data={data} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="course-structure">
            <Card>
              <CardHeader>
                <CardTitle>Course Structure</CardTitle>
                <CardDescription>
                  Provide course structure for the course
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
