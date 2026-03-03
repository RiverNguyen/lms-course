"use client";

import { CreateCourse } from "@/app/admin/courses/create/action";
import { AllCategoriesType } from "@/app/data/category/get-all-categories";
import Uploader from "@/components/file-uploader/uploader";
import { RichTextEditor } from "@/components/rich-text-editor/editor";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { tryCatch } from "@/hooks/try-catch";
import { useConfetti } from "@/hooks/use-confetti";
import {
  CourseSchemaType,
  courseLevels,
  courseSchema,
  courseStatuses,
} from "@/lib/zod-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusIcon, SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
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

const levelLabels: Record<string, string> = {
  Beginner: "Người mới bắt đầu",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
};

const statusLabels: Record<string, string> = {
  Draft: "Bản nháp",
  Published: "Đã xuất bản",
  Archived: "Đã lưu trữ",
};

interface CourseCreateFormProps {
  categories: AllCategoriesType[];
}

const CourseCreateForm = ({ categories }: CourseCreateFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const router = useRouter();
  const { triggerConfetti } = useConfetti();

  const form = useForm<CourseSchemaType>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      fileKey: "",
      price: "",
      duration: "",
      level: "Beginner",
      categoryId: null,
      smallDescription: "",
      slug: "",
      status: "Draft",
    },
  });

  const generateSlug = () => {
    const titleValue = form.getValues("title");
    const slug = slugify(titleValue);
    form.setValue("slug", slug, { shouldValidate: true });
  };

  // Convert plain text to TipTap JSON (simple: one paragraph per \n\n)
  const textToTiptapJson = (text: string): string => {
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
    if (paragraphs.length === 0) {
      return JSON.stringify({
        type: "doc",
        content: [{ type: "paragraph" }],
      });
    }
    const content = paragraphs.map((para) => ({
      type: "paragraph",
      content: [{ type: "text", text: para.trim() }],
    }));
    return JSON.stringify({ type: "doc", content });
  };

  const handleAiSuggest = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Vui lòng nhập gợi ý hoặc từ khóa");
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/admin/course-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Lỗi không xác định" }));
        throw new Error(error.error || "Lỗi khi gọi AI");
      }

      const data = await res.json();

      // Fill form fields
      if (data.title) {
        form.setValue("title", data.title, { shouldValidate: true });
        // Auto-generate slug from title
        const slug = slugify(data.title);
        form.setValue("slug", slug, { shouldValidate: true });
      }
      if (data.smallDescription) {
        form.setValue("smallDescription", data.smallDescription, {
          shouldValidate: true,
        });
      }
      if (data.description) {
        const tiptapJson = textToTiptapJson(data.description);
        form.setValue("description", tiptapJson, { shouldValidate: true });
      }

      toast.success("Đã tạo nội dung bằng AI!");
      setAiDialogOpen(false);
      setAiPrompt("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi gọi AI");
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmit = (data: CourseSchemaType) => {
    startTransition(async () => {
      const { data: response, error } = await tryCatch(CreateCourse(data));

      if (error) {
        toast.error(error.message);
        return;
      }

      if (response.status === "success") {
        toast.success(response.message);
        triggerConfetti();
        form.reset();
        router.push("/admin/courses");
      } else if (response.status === "error") {
        toast.error(response.message);
      }
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Thông tin khóa học</h3>
          <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="gap-2">
                <SparklesIcon className="size-4" />
                Gợi ý bằng AI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Gợi ý nội dung khóa học bằng AI</DialogTitle>
                <DialogDescription>
                  Nhập từ khóa hoặc mô tả ngắn về khóa học, AI sẽ tạo tiêu đề,
                  mô tả ngắn và mô tả chi tiết.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea
                  placeholder="Ví dụ: Khóa học lập trình Python cho người mới bắt đầu, học từ cơ bản đến nâng cao..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="min-h-[120px]"
                  disabled={aiLoading}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAiDialogOpen(false);
                    setAiPrompt("");
                  }}
                  disabled={aiLoading}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={aiLoading || !aiPrompt.trim()}
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="size-4 mr-2" />
                      Tạo nội dung
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-start gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Tiêu đề</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="Nhập tiêu đề khóa học"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4 w-full">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="Nhập slug của khóa học"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              className="w-fit mt-5.5"
              onClick={generateSlug}
            >
              Tạo Slug <SparklesIcon className="ml-1" size={16} />
            </Button>
          </div>
        </div>

        <FormField
          control={form.control}
          name="smallDescription"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Mô tả ngắn</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập mô tả ngắn của khóa học"
                  className="min-h-[120px]"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="w-full">
                <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <RichTextEditor field={field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fileKey"
          render={({ field }) => (
            <FormItem className="w-full">
                <FormLabel>Ảnh bìa</FormLabel>
              <FormControl>
                <Uploader
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-start gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Danh mục</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? null : value)
                  }
                  value={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger className="w-full" disabled={isPending}>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Không có</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Trình độ</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full" disabled={isPending}>
                      <SelectValue placeholder="Chọn trình độ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courseLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {levelLabels[level] ?? level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Thời lượng (giờ)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập thời lượng khóa học (giờ)"
                    disabled={isPending}
                    type="number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Giá (₫)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập giá khóa học (₫)"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Trạng thái</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full" disabled={isPending}>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courseStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusLabels[status] ?? status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating course...
            </>
          ) : (
            <>
              Tạo Khóa học <PlusIcon className="ml-1" size={16} />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CourseCreateForm;
