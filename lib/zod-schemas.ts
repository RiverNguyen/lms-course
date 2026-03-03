import z from "zod";

export const courseLevels = ["Beginner", "Intermediate", "Advanced"];

export const courseStatuses = ["Draft", "Published", "Archived"];

export const courseCategories = [
  "Development",
  "Business",
  "Finance",
  "IT & Software",
  "Office Productivity",
  "Personal Development",
  "Design",
  "Marketing",
  "Health & Fitness",
  "Music",
  "Teaching & Academics",
] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Tiêu đề phải có ít nhất 3 ký tự" })
    .max(100, { message: "Tiêu đề không được vượt quá 100 ký tự" }),
  description: z
    .string()
    .min(3, { message: "Mô tả phải có ít nhất 3 ký tự" }),
  fileKey: z.string().min(1),
  price: z
    .string()
    .regex(/^\d+$/, "Giá phải là số nguyên (VND)")
    .refine((val) => Number(val) > 0, "Giá phải lớn hơn 0"),
  duration: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Thời lượng phải là số thập phân hợp lệ")
    .refine((val) => Number(val) > 0, "Thời lượng phải lớn hơn 0"),
  level: z.enum(courseLevels, { message: "Trình độ khóa học không hợp lệ" }),
  categoryId: z
    .string()
    .uuid({ message: "ID danh mục không hợp lệ" })
    .optional()
    .nullable(),
  smallDescription: z
    .string()
    .min(3, { message: "Mô tả ngắn phải có ít nhất 3 ký tự" }),
  slug: z
    .string()
    .min(3, { message: "Slug phải có ít nhất 3 ký tự" })
    .max(100, { message: "Slug không được vượt quá 100 ký tự" }),
  status: z.enum(courseStatuses, { message: "Trạng thái khóa học không hợp lệ" }),
});

export const chapterSchema = z.object({
  name: z.string().min(3, { message: "Tên phải có ít nhất 3 ký tự" }),
  courseId: z.string().uuid({ message: "ID khóa học không hợp lệ" }),
});

export const lessonSchema = z.object({
  name: z.string().min(3, { message: "Tên phải có ít nhất 3 ký tự" }),
  chapterId: z.string().uuid({ message: "ID chương không hợp lệ" }),
  courseId: z.string().uuid({ message: "ID khóa học không hợp lệ" }),
  description: z.string().optional(),
  thumbnailKey: z.string().optional(),
  videoKey: z.string().optional(),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(3, { message: "Tên phải có ít nhất 3 ký tự" })
    .max(100, { message: "Tên không được vượt quá 100 ký tự" }),
  slug: z
    .string()
    .min(3, { message: "Slug phải có ít nhất 3 ký tự" })
    .max(100, { message: "Slug không được vượt quá 100 ký tự" }),
  description: z
    .string()
    .max(500, { message: "Mô tả không được vượt quá 500 ký tự" })
    .optional(),
});

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Họ tên phải có ít nhất 2 ký tự" })
    .max(100, { message: "Họ tên không được vượt quá 100 ký tự" }),
  email: z
    .string()
    .email({ message: "Email không hợp lệ" })
    .min(1, { message: "Email là bắt buộc" }),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, { message: "Số điện thoại không hợp lệ" })
    .min(10, { message: "Số điện thoại phải có ít nhất 10 số" })
    .max(20, { message: "Số điện thoại không được vượt quá 20 ký tự" }),
  message: z
    .string()
    .min(10, { message: "Nội dung câu hỏi phải có ít nhất 10 ký tự" })
    .max(1000, { message: "Nội dung không được vượt quá 1000 ký tự" }),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;

export type ChapterSchemaType = z.infer<typeof chapterSchema>;

export type LessonSchemaType = z.infer<typeof lessonSchema>;

export type CategorySchemaType = z.infer<typeof categorySchema>;

export type ContactSchemaType = z.infer<typeof contactSchema>;
