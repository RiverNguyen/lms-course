'use client'

import { Button } from "@/components/ui/button"
import { tryCatch } from "@/hooks/try-catch";
import { useTransition } from "react";
import { enrollInCourseAction } from "../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const EnrollmentButton = ({ courseId }: { courseId: string }) => {
  const [isPending, startTransition] = useTransition();

  const onSubmit = () => {
    startTransition(async () => {
      const { data: response, error } = await tryCatch(enrollInCourseAction(courseId));

      if (error) {
        toast.error(error.message);
        return;
      }

      if (response.status === "success") {
        toast.success(response.message);
      } else if (response.status === "error") {
        toast.error(response.message);
      }
    });
  }

  return (
    <Button className="w-full" onClick={onSubmit} disabled={isPending}>
      {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Enroll Now!'}
    </Button>
  )
}