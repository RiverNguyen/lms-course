import "server-only";

import { env } from "@/lib/env";
import { S3Client } from "@aws-sdk/client-s3";

export const S3 = new S3Client({
  region: env.AWS_REGION,
  endpoint: env.AWS_ENDPOINT_URL_S3,
  forcePathStyle: false,
});
