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
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must be less than 100 characters" }),
  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters" }),
  fileKey: z.string().min(1),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid decimal")
    .refine((val) => Number(val) > 0, "Price must be greater than 0"),
  duration: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Duration must be a valid decimal")
    .refine((val) => Number(val) > 0, "Duration must be greater than 0"),
  level: z.enum(courseLevels, { message: "Invalid course level" }),
  categoryId: z
    .string()
    .uuid({ message: "Invalid category ID" })
    .optional()
    .nullable(),
  smallDescription: z
    .string()
    .min(3, { message: "Small description must be at least 3 characters" }),
  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters" })
    .max(100, { message: "Slug must be less than 100 characters" }),
  status: z.enum(courseStatuses, { message: "Invalid course status" }),
});

export const chapterSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  courseId: z.string().uuid({ message: "Invalid course ID" }),
});

export const lessonSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  chapterId: z.string().uuid({ message: "Invalid chapter ID" }),
  courseId: z.string().uuid({ message: "Invalid course ID" }),
  description: z.string().optional(),
  thumbnailKey: z.string().optional(),
  videoKey: z.string().optional(),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters" })
    .max(100, { message: "Slug must be less than 100 characters" }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
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
