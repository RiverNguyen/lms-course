"use client"

import { LessonContent } from "@/app/data/course/get-lesson-content";
import { RenderDescription } from "@/components/rich-text-editor/render-description";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { VideoPlayer } from "./video-player";
import { useTransition, useState, useEffect } from "react";
import { markLessonAsCompletedAction } from "../actions";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";
import { useConfetti } from "@/hooks/use-confetti";
import { useRouter } from "next/navigation";

interface CourseContentProps {
  data: LessonContent
}

export default function CourseContent({ data }: CourseContentProps) {
  const [isPending, startTransition] = useTransition();
  const { triggerConfetti } = useConfetti()
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(data.lessonProgresses.length > 0);

  // Update completion status when data changes (e.g., after revalidation)
  useEffect(() => {
    setIsCompleted(data.lessonProgresses.length > 0);
  }, [data.lessonProgresses.length]);

  const markLessonAsCompleted = () => {
    // Don't mark if already completed
    if (isCompleted) return;

    // Optimistically update UI
    setIsCompleted(true);

    startTransition(async () => {
      const { data: response, error } = await tryCatch(markLessonAsCompletedAction(data.id, data.chapter.course?.slug || ''));

      if (error) {
        toast.error(error.message);
        // Revert optimistic update on error
        setIsCompleted(false);
        return;
      }

      if (response.status === "success") {
        toast.success(response.message);
        if (response.courseCompleted) {
          // Trigger confetti for course completion
          triggerConfetti();
          // Show certificate notification after confetti
          setTimeout(() => {
            toast.success("Chứng chỉ đã được cấp! Xem trong trang Certificates.", {
              action: {
                label: "Xem ngay",
                onClick: () => window.location.href = "/dashboard/certificates",
              },
            });
          }, 1000);
        } else {
          // Small confetti for lesson completion
          triggerConfetti();
          
          // Auto-navigate to next lesson if available
          if (response.nextLessonId) {
            setTimeout(() => {
              router.push(`/dashboard/${data.chapter.course?.slug || ''}/${response.nextLessonId}`);
            }, 1500); // Wait a bit for confetti animation
          }
        }
      } else if (response.status === "error") {
        toast.error(response.message);
        // Revert optimistic update on error
        setIsCompleted(false);
      }
    });
  };
  return (
    <div className="flex flex-col h-full bg-background pl-6">
      <VideoPlayer 
        thumbnailKey={data.thumbnailKey || ''} 
        videoKey={data.videoKey || ''} 
        onVideoEnd={markLessonAsCompleted}
      />
      <div className="py-4 border-b">
        {isCompleted ? (
          <Button variant={"outline"} className="bg-green-500/10 text-green-500 hover:text-green-500">
            <CheckCircle className="size-4 mr-2 text-green-500" />
            Lesson completed
          </Button>
        ) : (
          <Button variant={"outline"} disabled={isPending} onClick={markLessonAsCompleted}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4 mr-2 text-green-500" />}
            Mark as completed
          </Button>
        )}
      </div>

      <div className="space-y-3 pt-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{data.title}</h1>
        {data.description && (<RenderDescription description={JSON.parse(data.description)} />)}
      </div>
    </div>
  );
}