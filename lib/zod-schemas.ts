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
    .min(3, { message: "Description must be at least 3 characters" })
    .max(1000, { message: "Description must be less than 1000 characters" }),
  fileKey: z.string().min(1),
  galleryKeys: z.array(z.string()).optional(),
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
    .min(3, { message: "Small description must be at least 3 characters" })
    .max(100, {
      message: "Small description must be less than 100 characters",
    }),
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

export type CourseSchemaType = z.infer<typeof courseSchema>;

export type ChapterSchemaType = z.infer<typeof chapterSchema>;

export type LessonSchemaType = z.infer<typeof lessonSchema>;

export type CategorySchemaType = z.infer<typeof categorySchema>;
