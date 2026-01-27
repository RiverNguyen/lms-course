import { CategoriesTable } from "@/app/admin/categories/_components/categories-table";
import { adminGetCategories } from "@/app/data/admin/admin-get-categories";
import EmptyState from "@/components/general/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Suspense } from "react";

const CategoriesPage = () => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize all your categories
          </p>
        </div>
        <Link href="/admin/categories/create" className={buttonVariants()}>
          Create Category
        </Link>
      </div>

      <Suspense fallback={<CategoriesTableSkeleton />}>
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
        <CategoriesTable categories={data} />
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

function CategoriesTableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Skeleton className="h-9 w-full max-w-sm" />
      </div>
      <div className="rounded-md border">
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoriesPage;
