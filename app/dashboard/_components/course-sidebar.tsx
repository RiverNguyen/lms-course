"use client";

import LessonItem from "@/app/dashboard/_components/lesson-item";
import { CourseSidebarData } from "@/app/data/course/get-course-sidebar-data";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Play } from "lucide-react";
import { usePathname } from "next/navigation";
interface CourseSidebarProps {
  course: CourseSidebarData["course"];
}

export default function CourseSidebar({ course }: CourseSidebarProps) {
  const pathname = usePathname();
  const currentLessonId = pathname.split("/").pop();

  return (
    <div className="flex flex-col h-full">
      <div className="pb-4 pr-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Play className="size-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-base leading-tight truncate">{course.title}</h1>
            <p className="text-xs text-muted-foreground mt-1 truncate">{course.category?.name}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">4/10 lessons</span>
          </div>
          <AnimatedCircularProgressBar max={10} min={0} value={5} gaugePrimaryColor="var(--primary)" gaugeSecondaryColor="color-mix(in oklch, var(--primary) 20%, transparent)" className="mx-auto" />
          <p className="text-sm font-medium mt-2 text-center">55% complete</p>
        </div>
      </div>

      <div className="py-4 pr-4 space-y-3">
        {course.chapters.map((chapter, index) => (
          <Collapsible key={chapter.id} defaultOpen={index === 0}>
            <CollapsibleTrigger asChild>
              <Button variant={"outline"} className="w-full p-3 h-auto flex items-center gap-2">
                <div className="shrink-0">
                  <ChevronDown className="size-4 text-primary" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-sm truncate text-foreground">
                    {chapter.position}: {chapter.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{chapter.lessons.length} Lesson{chapter.lessons.length > 1 ? "s" : ""}</p>
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 pl-6 border-l-2 space-y-3">
              {chapter.lessons.map((lesson) => (
                <LessonItem key={lesson.id} lesson={lesson} slug={course.slug} isActive={currentLessonId === lesson.id} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}