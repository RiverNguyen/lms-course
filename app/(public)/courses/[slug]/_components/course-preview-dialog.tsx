"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PreviewVideoPlayer } from "./preview-video-player";
import type { IndividualCourseType } from "@/app/data/course/get-course";
import { IconPlayerPlay } from "@tabler/icons-react";

function getFirstLessonWithVideo(
  course: IndividualCourseType | null
): { videoKey: string; thumbnailKey: string | null; title: string } | null {
  if (!course?.chapters?.length) return null;
  for (const chapter of course.chapters) {
    for (const lesson of chapter.lessons) {
      if (lesson.videoKey) {
        return {
          videoKey: lesson.videoKey,
          thumbnailKey: lesson.thumbnailKey ?? null,
          title: lesson.title,
        };
      }
    }
  }
  return null;
}

interface CoursePreviewDialogProps {
  course: IndividualCourseType | null;
  isEnrolled: boolean;
}

export function CoursePreviewDialog({ course, isEnrolled }: CoursePreviewDialogProps) {
  const previewLesson = getFirstLessonWithVideo(course);

  if (isEnrolled || !previewLesson) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <IconPlayerPlay className="size-4" />
          Xem thử 2 phút đầu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Xem thử bài học</DialogTitle>
        </DialogHeader>
        <div className="p-4 pb-0">
          <p className="text-sm text-muted-foreground">
            Xem trước 2 phút đầu bài học &quot;{previewLesson.title}&quot;
          </p>
        </div>
        <div className="p-4">
          <PreviewVideoPlayer
            videoKey={previewLesson.videoKey}
            thumbnailKey={previewLesson.thumbnailKey}
            lessonTitle={previewLesson.title}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
