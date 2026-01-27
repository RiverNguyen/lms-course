import { UsersTable } from "@/app/admin/users/_components/users-table";
import { adminGetUsers } from "@/app/data/admin/admin-get-users";
import EmptyState from "@/components/general/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

const UsersPage = () => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all users
          </p>
        </div>
      </div>

      <Suspense fallback={<UsersTableSkeleton />}>
        <RenderUsers />
      </Suspense>
    </>
  );
};

async function RenderUsers() {
  const data = await adminGetUsers();

  return (
    <>
      {data?.length > 0 ? (
        <UsersTable users={data} />
      ) : (
        <EmptyState
          title="No users found"
          description="Users will appear here once they register"
        />
      )}
    </>
  );
}

function UsersTableSkeleton() {
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

export default UsersPage;
