import { auth } from "@/lib/auth";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { env } from "@/lib/env";
import { S3 } from "@/lib/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import z from "zod";

const avatarUploadSchema = z.object({
  fileName: z.string().min(1, { message: "Filename is required" }),
  contentType: z
    .string()
    .refine((t) => /^image\//.test(t), { message: "Only image files allowed" }),
  size: z.number().max(2 * 1024 * 1024), // 2MB max
});

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 5,
  })
);

export const POST = async (request: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decision = await aj.protect(request, {
      fingerprint: session.user.id as string,
    });

    if (decision.isDenied()) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const validation = avatarUploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Chỉ chấp nhận file ảnh, tối đa 2MB" },
        { status: 400 }
      );
    }

    const { fileName, contentType, size } = validation.data;
    const uniqueKey = `avatars/${session.user.id}/${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGE,
      ContentType: contentType,
      ContentLength: size,
      Key: uniqueKey,
    });

    const presignedUrl = await getSignedUrl(S3, command, {
      expiresIn: 360,
    });

    const publicUrl = `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGE}.t3.storage.dev/${uniqueKey}`;

    return NextResponse.json({
      presignedUrl,
      key: uniqueKey,
      publicUrl,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
