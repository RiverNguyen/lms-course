"use client"

import { LessonContent } from "@/app/data/course/get-lesson-content";
import { RenderDescription } from "@/components/rich-text-editor/render-description";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { VideoPlayer } from "./video-player";
import { useTransition } from "react";
import { markLessonAsCompletedAction } from "../actions";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";
import { useConfetti } from "@/hooks/use-confetti";

interface CourseContentProps {
  data: LessonContent
}

export default function CourseContent({ data }: CourseContentProps) {
  const [isPending, startTransition] = useTransition();
  const { triggerConfetti } = useConfetti()

  const markLessonAsCompleted = () => {
    startTransition(async () => {
      const { data: response, error } = await tryCatch(markLessonAsCompletedAction(data.id, data.chapter.course?.slug || ''));

      if (error) {
        toast.error(error.message);
        return;
      }

      if (response.status === "success") {
        toast.success(response.message);
        triggerConfetti();
      } else if (response.status === "error") {
        toast.error(response.message);
      }
    });
  };
  return (
    <div className="flex flex-col h-full bg-background pl-6">
      <VideoPlayer thumbnailKey={data.thumbnailKey || ''} videoKey={data.videoKey || ''} />
      <div className="py-4 border-b">
        {data.lessonProgresses.length > 0 ? (
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