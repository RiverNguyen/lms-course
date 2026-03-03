import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const courseMetaSchema = z.object({
  title: z.string().describe("Tiêu đề khóa học, ngắn gọn và hấp dẫn"),
  smallDescription: z
    .string()
    .describe("Mô tả ngắn 1-3 câu cho thẻ meta và danh sách khóa học"),
  description: z
    .string()
    .describe("Mô tả chi tiết khóa học, có thể nhiều đoạn văn, plain text"),
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

  let body: { prompt: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const prompt =
    typeof body.prompt === "string" && body.prompt.trim()
      ? body.prompt.trim()
      : null;
  if (!prompt) {
    return NextResponse.json(
      { error: "prompt là bắt buộc và không được để trống" },
      { status: 400 }
    );
  }

  const systemPrompt = `Bạn là trợ lý soạn nội dung khóa học cho nền tảng LMS.
Nhiệm vụ: Từ gợi ý (từ khóa hoặc outline) của người dùng, tạo:
1. title: Tiêu đề khóa học ngắn gọn, hấp dẫn, dưới 100 ký tự.
2. smallDescription: Mô tả ngắn 1-3 câu (khoảng 150-300 ký tự), dùng cho thẻ meta và danh sách khóa.
3. description: Mô tả chi tiết khóa học, nhiều đoạn văn nếu cần, plain text (không HTML). Nêu rõ đối tượng, nội dung, kết quả đạt được.

Trả lời bằng tiếng Việt trừ khi người dùng yêu cầu ngôn ngữ khác.`;

  try {
    const { output: result } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: `Gợi ý của người dùng: ${prompt}`,
      output: Output.object({
        schema: courseMetaSchema,
        description: "Course metadata: title, smallDescription, description",
      }),
    });

    if (!result) {
      return NextResponse.json(
        { error: "AI không trả về dữ liệu hợp lệ" },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[AI course-meta]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi khi gọi AI" },
      { status: 500 }
    );
  }
}
