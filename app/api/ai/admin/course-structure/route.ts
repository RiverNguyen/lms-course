import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const lessonSchema = z.object({
  name: z.string().describe("Tên bài học"),
});

const chapterSchema = z.object({
  name: z.string().describe("Tên chương"),
  lessons: z
    .array(lessonSchema)
    .describe("Danh sách bài học trong chương, ít nhất 1 bài"),
});

const courseStructureSchema = z.object({
  chapters: z
    .array(chapterSchema)
    .min(1)
    .describe("Danh sách chương, mỗi chương có tên và danh sách bài học"),
});

export async function POST(req: Request) {
  if (!env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "AI chưa được cấu hình. Cần OPENAI_API_KEY." },
      { status: 503 }
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { courseDescription?: string; courseTitle?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const courseDescription =
    typeof body.courseDescription === "string"
      ? body.courseDescription.trim()
      : "";
  const courseTitle =
    typeof body.courseTitle === "string" ? body.courseTitle.trim() : "";

  if (!courseDescription && !courseTitle) {
    return NextResponse.json(
      {
        error:
          "Cần ít nhất một trong hai: courseDescription hoặc courseTitle",
      },
      { status: 400 }
    );
  }

  const systemPrompt = `Bạn là trợ lý soạn cấu trúc khóa học cho nền tảng LMS.
Nhiệm vụ: Từ tiêu đề và/hoặc mô tả khóa học, đề xuất cấu trúc gồm các chương (chapters), mỗi chương có các bài học (lessons).
- Mỗi chương: tên rõ ràng, logic (ví dụ: "Giới thiệu", "Cài đặt môi trường", "Cú pháp cơ bản", ...).
- Mỗi bài học: tên ngắn gọn, cụ thể (ví dụ: "Biến và kiểu dữ liệu", "Vòng lặp for").
- Số chương hợp lý (thường 3-8 chương), mỗi chương 2-6 bài.
- Trả về đúng JSON theo schema: chapters[].name, chapters[].lessons[].name.
- Tên dùng tiếng Việt trừ khi nội dung khóa là tiếng Anh.`;

  const userContent = courseTitle
    ? `Tiêu đề khóa: ${courseTitle}\n${courseDescription ? `Mô tả khóa:\n${courseDescription}` : ""}`
    : `Mô tả khóa:\n${courseDescription}`;

  try {
    const { output: result } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userContent,
      output: Output.object({
        schema: courseStructureSchema,
        description: "Course structure: chapters with lessons",
      }),
    });

    if (!result || !("chapters" in result) || !Array.isArray(result.chapters)) {
      return NextResponse.json(
        { error: "AI không trả về cấu trúc hợp lệ" },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[AI course-structure]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi khi gọi AI" },
      { status: 500 }
    );
  }
}
