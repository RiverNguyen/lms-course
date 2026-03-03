import { env } from "@/lib/env";

/** URL ảnh placeholder khi khóa học không có ảnh (file trong public/) */
export const COURSE_PLACEHOLDER_IMAGE = "/placeholder.png";

/** Key dùng khi seed khóa học — file không có trên S3, nên hiển thị ảnh local */
const PLACEHOLDER_FILE_KEY = "courses/placeholder.png";

/**
 * Trả về URL ảnh khóa học từ S3, hoặc placeholder nếu không có fileKey / key là placeholder.
 * Dùng được cả ở server component và client component.
 */
export function getCourseImageUrl(key?: string | null): string {
  if (!key?.trim()) return COURSE_PLACEHOLDER_IMAGE;
  if (key === PLACEHOLDER_FILE_KEY) return COURSE_PLACEHOLDER_IMAGE;
  return `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGE}.t3.storage.dev/${key}`;
}

export const useConstructUrl = (key?: string | null) => {
  return getCourseImageUrl(key);
};
