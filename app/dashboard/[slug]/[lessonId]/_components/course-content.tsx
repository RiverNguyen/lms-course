"use client"

import { LessonContent } from "@/app/data/course/get-lesson-content";
import { RenderDescription } from "@/components/rich-text-editor/render-description";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { VideoPlayer } from "./video-player";

interface CourseContentProps {
  data: LessonContent
}

export default function CourseContent({ data }: CourseContentProps) {
  return (
    <div className="flex flex-col h-full bg-background pl-6">
      <VideoPlayer thumbnailKey={data.thumbnailKey || ''} videoKey={data.videoKey || ''} />
      <div className="py-4 border-b">
        <Button variant={"outline"}>
          <CheckCircle className="size-4 mr-2 text-green-500" />
          Mark as completed
        </Button>
      </div>

      <div className="space-y-3 pt-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{data.title}</h1>
        {data.description && (<RenderDescription description={JSON.parse(data.description)} />)}
      </div>
    </div>
  );
}