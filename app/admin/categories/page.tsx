import AdminCategoryCard, {
  AdminCategoryCardSkeleton,
} from "@/app/admin/categories/_components/admin-category-card";
import { adminGetCategories } from "@/app/data/admin/admin-get-categories";
import EmptyState from "@/components/general/empty-state";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

const CategoriesPage = () => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link href="/admin/categories/create" className={buttonVariants()}>
          Create Category
        </Link>
      </div>

      <Suspense fallback={<AdminCategoryCardSkeletonLayout />}>
        <RenderCategories />
      </Suspense>
    </>
  );
};

async function RenderCategories() {
  const data = await adminGetCategories();

  return (
    <>
      {data?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-6">
          {data?.map((category) => (
            <AdminCategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No categories found"
          description="Create a new category to get started"
          buttonText="Create Category"
          href="/admin/categories/create"
        />
      )}
    </>
  );
}

function AdminCategoryCardSkeletonLayout() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <AdminCategoryCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default CategoriesPage;
