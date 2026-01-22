import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { RemoveLesson } from "@/app/admin/courses/[courseId]/edit/action";
import { toast } from "sonner";

const DeleteLesson = ({
  chapterId,
  courseId,
  lessonId,
}: {
  chapterId: string;
  courseId: string;
  lessonId: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const onDelete = async () => {
    startTransition(async () => {
      const { data: response, error } = await tryCatch(
        RemoveLesson(chapterId, courseId, lessonId)
      );
      if (error) {
        toast.error("Failed to delete lesson");
        return;
      }
      if (response.status === "success") {
        toast.success(response.message);
        setIsOpen(false);
      } else if (response.status === "error") {
        toast.error(response.message);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2Icon className="size-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this lesson?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This lesson will be deleted permanently.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} disabled={isPending}>
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteLesson;
