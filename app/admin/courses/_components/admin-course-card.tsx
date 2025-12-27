import { AdminCourseType } from "@/app/data/admin/admin-get-courses";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConstructUrl } from "@/hooks/use-construct-url";
import {
  ArrowRightIcon,
  EyeIcon,
  MoreVerticalIcon,
  PencilIcon,
  SchoolIcon,
  TimerIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AdminCourseCardProps {
  course: AdminCourseType;
}

const AdminCourseCard = ({ course }: AdminCourseCardProps) => {
  const imageUrl = useConstructUrl(course.fileKey);
  return (
    <Card className="group relative py-0 gap-0">
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"secondary"} size={"icon"}>
              <MoreVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`/admin/courses/${course?.id}/edit`}>
                <PencilIcon className="size-4 mr-2" />
                Edit Course
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/courses/${course?.slug}`}>
                <EyeIcon className="size-4 mr-2" />
                Preview Course
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/courses/${course?.id}/delete`}>
                <Trash2Icon className="size-4 mr-2 text-destructive" />
                Delete Course
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Image
        src={imageUrl}
        alt={course.title}
        width={600}
        height={600}
        className="w-full rounded-t-lg aspect-video h-full object-cover"
      />

      <CardContent className="p-4">
        <Link
          className="font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors duration-300"
          href={`/admin/courses/${course?.id}/edit`}
        >
          {course?.title}
        </Link>

        <p className="line-clamp-2 text-sm text-muted-foreground leading-tight mt-2">
          {course?.smallDescription}
        </p>

        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <TimerIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <p className="text-xsm text-muted-foreground">
              {course?.duration} hours
            </p>
          </div>
          <div className="flex items-center gap-x-2">
            <SchoolIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <p className="text-xsm text-muted-foreground">{course?.level}</p>
          </div>
        </div>

        <Link
          href={`/admin/courses/${course?.id}/edit`}
          className={buttonVariants({
            className: "w-full mt-4",
          })}
        >
          Edit Course <ArrowRightIcon className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
};

export default AdminCourseCard;
