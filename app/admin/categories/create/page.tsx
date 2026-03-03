"use client";

import { CreateCategory } from "@/app/admin/categories/create/action";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { tryCatch } from "@/hooks/try-catch";
import { useConfetti } from "@/hooks/use-confetti";
import { CategorySchemaType, categorySchema } from "@/lib/zod-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, Loader2, PlusIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { toast } from "sonner";

const CategoryCreatePage = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { triggerConfetti } = useConfetti();

  const form = useForm<CategorySchemaType>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const generateSlug = () => {
    const nameValue = form.getValues("name");
    const slug = slugify(nameValue, { lower: true });
    form.setValue("slug", slug, { shouldValidate: true });
  };

  const onSubmit = (data: CategorySchemaType) => {
    startTransition(async () => {
      const { data: response, error } = await tryCatch(CreateCategory(data));

      if (error) {
        toast.error(error.message);
        return;
      }

      if (response.status === "success") {
        toast.success(response.message);
        triggerConfetti();
        form.reset();
        router.push("/admin/categories");
      } else if (response.status === "error") {
        toast.error(response.message);
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Link
          href="/admin/categories"
          className={buttonVariants({
            variant: "outline",
            size: "icon",
          })}
        >
          <ArrowLeftIcon className="size-4" />
        </Link>
        <h1 className="text-2xl font-bold">Tạo danh mục mới</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Danh mục</CardTitle>
          <CardDescription>
            Nhập thông tin về danh mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex items-start gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Tên</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Nhập tên danh mục"
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
                            placeholder="Nhập slug của danh mục"
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
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Mô tả (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập mô tả của danh mục"
                        className="min-h-[120px]"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang tạo danh mục...
                  </>
                ) : (
                  <>
                    Tạo Danh mục <PlusIcon className="ml-1" size={16} />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default CategoryCreatePage;
