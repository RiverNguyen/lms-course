import { Skeleton } from "@/components/ui/skeleton";

export default function CourseSidebarSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Course Header */}
      <div className="pb-4 pr-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="size-10 rounded-lg shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="size-32 rounded-full" />
          </div>
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      </div>

      {/* Chapters List */}
      <div className="py-4 pr-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            {/* Chapter Header */}
            <Skeleton className="h-12 w-full rounded-md" />
            
            {/* Lessons */}
            <div className="pl-6 border-l-2 space-y-3">
              {[1, 2].map((j) => (
                <Skeleton key={j} className="h-10 w-full rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
