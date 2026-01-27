import { Skeleton } from "@/components/ui/skeleton";

export default function CourseContentSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background pl-6">
      {/* Video Player */}
      <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden relative">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="size-16 rounded-full" />
        </div>
        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-2 flex-1 rounded-full" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>
      </div>

      {/* Lesson Completed Button */}
      <div className="py-4 border-b">
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Lesson Title and Content */}
      <div className="space-y-3 pt-3">
        <Skeleton className="h-9 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}
