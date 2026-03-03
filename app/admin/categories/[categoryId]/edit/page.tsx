import EditCategoryForm from "@/app/admin/categories/[categoryId]/edit/_components/edit-category-form";
import { adminGetCategory } from "@/app/data/admin/admin-get-category";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Params = Promise<{ categoryId: string }>;

const EditCategoryPage = async ({ params }: { params: Params }) => {
  const { categoryId } = await params;
  const data = await adminGetCategory(categoryId);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Chỉnh sửa Danh mục:{" "}
        <span className="text-primary underline">{data?.name}</span>
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Danh mục</CardTitle>
          <CardDescription>
            Cập nhật thông tin về danh mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditCategoryForm data={data} />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditCategoryPage;
