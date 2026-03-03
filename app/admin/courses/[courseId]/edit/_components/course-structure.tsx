"use client";

import NewChapterModal from "@/app/admin/courses/[courseId]/edit/_components/new-chapter-modal";
import NewLessonModal from "@/app/admin/courses/[courseId]/edit/_components/new-lesson-modal";
import {
  ReorderChapters,
  ReorderLessons,
  CreateCourseStructureFromAI,
} from "@/app/admin/courses/[courseId]/edit/action";
import { AdminCourseSingleType } from "@/app/data/admin/admin-get-course";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  DraggableSyntheticListeners,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  FileTextIcon,
  GripVerticalIcon,
  SparklesIcon,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { tryCatch } from "@/hooks/try-catch";
import DeleteChapter from "./delete-chapter";
import DeleteLesson from "./delete-lesson";

interface CourseStructureProps {
  data: AdminCourseSingleType;
}

interface SortableItemProps {
  id: string;
  children: (listeners: DraggableSyntheticListeners) => React.ReactNode;
  className?: string;
  data?: {
    type: "chapter" | "lesson";
    chapterId?: string;
  };
}

const CourseStructure = ({ data }: CourseStructureProps) => {
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const initialItems = data.chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    order: chapter.position,
    isOpen: true,
    lessons:
      chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.position,
      })) || [],
  }));

  const [items, setItems] = useState<typeof initialItems>(initialItems);

  useEffect(() => {
    setItems((prevItems) => {
      const updatedItems =
        data.chapters.map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          order: chapter.position,
          isOpen:
            prevItems.find((item) => item.id === chapter.id)?.isOpen ?? true,
          lessons: chapter.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            order: lesson.position,
          })),
        })) || [];

      return updatedItems;
    });
  }, [data]);

  function SortableItem({ children, id, className, data }: SortableItemProps) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id, data });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn("touch-none", className, isDragging ? "z-10" : "")}
      >
        {children(listeners)}
      </div>
    );
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;
    const activeType = active.data.current?.type as "chapter" | "lesson";
    const overType = over.data.current?.type as "chapter" | "lesson";
    const courseId = data.id;

    if (activeType === "chapter") {
      let targetChapterId: string | null = null;

      if (overType === "chapter") {
        targetChapterId = overId as string;
      } else if (overType === "lesson") {
        targetChapterId = over.data.current?.chapterId ?? null;
      }

      if (!targetChapterId) {
        toast.error("Failed to reorder chapters");
        return;
      }

      const oldIndex = items.findIndex((item) => item.id === activeId);
      const newIndex = items.findIndex((item) => item.id === targetChapterId);

      if (oldIndex === -1 || newIndex === -1) {
        toast.error("Failed to reorder chapters");
        return;
      }

      const reorderLocalChapter = arrayMove(items, oldIndex, newIndex);
      const updatedChapterForState = reorderLocalChapter.map(
        (chapter, index) => ({
          ...chapter,
          order: index + 1,
        })
      );

      const previousItems = [...items];

      setItems(updatedChapterForState);

      if (courseId) {
        const chaptersToUpdate = updatedChapterForState.map((chapter) => ({
          id: chapter.id,
          position: chapter.order,
        }));

        const reorderChaptersPromise = () =>
          ReorderChapters(courseId, chaptersToUpdate);
        toast.promise(reorderChaptersPromise, {
          loading: "Reordering chapters...",
          success: (result) => {
            if (result.status === "success") {
              return result.message;
            }
            throw new Error(result.message);
          },
          error: () => {
            setItems(previousItems);
            return "Failed to reorder chapters";
          },
        });
      }
    }

    if (activeType === "lesson" && overType === "lesson") {
      const chapterId = active.data.current?.chapterId;
      const overChapterId = over.data.current?.chapterId;

      if (!chapterId || chapterId !== overChapterId) {
        toast.error("Failed to reorder lessons");
        return;
      }

      const chapterIndex = items.findIndex(
        (chapter) => chapter.id === chapterId
      );

      if (chapterIndex === -1) {
        toast.error("Failed to reorder lessons");
        return;
      }

      const chapterToUpdate = items[chapterIndex];
      const oldLessonIndex = chapterToUpdate.lessons.findIndex(
        (lesson) => lesson.id === activeId
      );
      const newLessonIndex = chapterToUpdate.lessons.findIndex(
        (lesson) => lesson.id === overId
      );

      if (oldLessonIndex === -1 || newLessonIndex === -1) {
        toast.error("Failed to reorder lessons");
        return;
      }

      const reorderedLocalLessons = arrayMove(
        chapterToUpdate.lessons,
        oldLessonIndex,
        newLessonIndex
      );

      const updatedChapterForState = reorderedLocalLessons.map(
        (lesson, index) => ({
          ...lesson,
          order: index + 1,
        })
      );

      const newItems = [...items];

      newItems[chapterIndex] = {
        ...chapterToUpdate,
        lessons: updatedChapterForState,
      };

      const previousItems = [...items];
      setItems(newItems);

      if (courseId) {
        const lessonsToUpdate = updatedChapterForState.map((lesson) => ({
          id: lesson.id,
          position: lesson.order,
        }));

        const reorderLessonsPromise = () =>
          ReorderLessons(chapterId, lessonsToUpdate, courseId);
        toast.promise(reorderLessonsPromise, {
          loading: "Reordering lessons...",
          success: (result) => {
            if (result.status === "success") {
              return result.message;
            }
            throw new Error(result.message);
          },
          error: () => {
            setItems(previousItems);
            return "Failed to reorder lessons";
          },
        });
      }

      return;
    }
  }

  const toggleChapter = (chapterId: string) => {
    setItems(
      items.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, isOpen: !chapter.isOpen }
          : chapter
      )
    );
  };

  const handleAiStructureSuggest = async () => {
    if (!aiDescription.trim() && !data.title) {
      toast.error("Vui lòng nhập mô tả khóa học hoặc tiêu đề khóa học");
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/admin/course-structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseDescription: aiDescription || data.smallDescription || "",
          courseTitle: data.title || "",
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Lỗi không xác định" }));
        throw new Error(error.error || "Lỗi khi gọi AI");
      }

      const structure = await res.json();

      if (!structure.chapters || structure.chapters.length === 0) {
        throw new Error("AI không trả về cấu trúc hợp lệ");
      }

      // Create structure using server action
      startTransition(async () => {
        const { data: result, error } = await tryCatch(
          CreateCourseStructureFromAI(data.id, structure)
        );

        if (error) {
          toast.error(error.message);
          return;
        }

        if (result.status === "success") {
          toast.success(result.message);
          setAiDialogOpen(false);
          setAiDescription("");
          // Page will auto-refresh via revalidatePath in the action
          window.location.reload();
        } else if (result.status === "error") {
          toast.error(result.message);
        }
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi gọi AI");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <DndContext
      collisionDetection={rectIntersection}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle>Chương</CardTitle>
          <div className="flex items-center gap-2">
            <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="gap-2">
                  <SparklesIcon className="size-4" />
                  Gợi ý cấu trúc AI
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Gợi ý cấu trúc chương + bài bằng AI</DialogTitle>
                  <DialogDescription>
                    Nhập mô tả khóa học (hoặc để trống để dùng tiêu đề/mô tả hiện
                    tại), AI sẽ đề xuất cấu trúc chương và bài học.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Tiêu đề khóa: {data.title}</p>
                    {data.smallDescription && (
                      <p className="text-xs">Mô tả ngắn: {data.smallDescription}</p>
                    )}
                  </div>
                  <Textarea
                    placeholder="Nhập mô tả chi tiết khóa học (tùy chọn)..."
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    className="min-h-[120px]"
                    disabled={aiLoading || isPending}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAiDialogOpen(false);
                      setAiDescription("");
                    }}
                    disabled={aiLoading || isPending}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAiStructureSuggest}
                    disabled={aiLoading || isPending}
                  >
                    {aiLoading || isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="size-4 mr-2" />
                        Tạo cấu trúc
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <NewChapterModal courseId={data.id} />
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                data={{ type: "chapter" }}
              >
                {(listeners) => (
                  <Card>
                    <Collapsible
                      open={item.isOpen}
                      onOpenChange={() => toggleChapter(item.id)}
                    >
                      <div className="flex items-center justify-between border-b border-border p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="cursor-grab opacity-60 hover:opacity-100"
                            {...listeners}
                          >
                            <GripVerticalIcon className="size-4" />
                          </Button>
                          <CollapsibleTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="flex items-center"
                            >
                              <ChevronDown
                                className={cn(
                                  "size-4 transition-transform duration-300 ease-in-out",
                                  item.isOpen ? "" : "-rotate-90"
                                )}
                              />
                            </Button>
                          </CollapsibleTrigger>

                          <p className="cursor-pointer hover:text-primary transition-colors duration-300 pl-2">
                            {item.title}
                          </p>
                        </div>
                        <DeleteChapter chapterId={item.id} courseId={data.id} />
                      </div>
                      <CollapsibleContent>
                        <div className="p-1">
                          <SortableContext
                            items={item.lessons.map((lesson) => lesson.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {item.lessons.map((lesson) => (
                              <SortableItem
                                key={lesson.id}
                                id={lesson.id}
                                data={{ type: "lesson", chapterId: item.id }}
                              >
                                {(lessonsListeners) => (
                                  <div className="flex items-center justify-between p-2 hover:bg-accent rounded-sm">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        {...lessonsListeners}
                                      >
                                        <GripVerticalIcon className="size-4" />
                                      </Button>
                                      <FileTextIcon className="size-4" />
                                      <Link
                                        href={`/admin/courses/${data.id}/${item.id}/${lesson.id}`}
                                      >
                                        {lesson.title}
                                      </Link>
                                    </div>
                                    <DeleteLesson
                                      chapterId={item.id}
                                      courseId={data.id}
                                      lessonId={lesson.id}
                                    />
                                  </div>
                                )}
                              </SortableItem>
                            ))}
                          </SortableContext>
                          <div className="p-2">
                            <NewLessonModal
                              courseId={data.id}
                              chapterId={item.id}
                            />
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )}
              </SortableItem>
            ))}
          </SortableContext>
        </CardContent>
      </Card>
    </DndContext>
  );
};

export default CourseStructure;
