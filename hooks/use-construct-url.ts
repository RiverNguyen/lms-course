import { env } from "@/lib/env";

export const useConstructUrl = (key: string) => {
  return `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGE}.t3.storage.dev/${key}`;
};
