import { streamText, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import type { UIMessage } from "ai";
import { getAllCourses } from "@/app/data/course/get-all-courses";
import { env } from "@/lib/env";

const SYSTEM_PROMPT = `You are a friendly AI assistant for TunaLMS, an online learning platform (LMS).
Your role:
- Help users find courses that match their interests, level (Beginner/Intermediate/Advanced), or topic.
- Answer questions about the platform, how to enroll, how learning works.
- Be concise and helpful. Use the course list below to give accurate recommendations.

When you recommend exactly one course, you MUST output a structured block so the UI can show a course card. Use this exact format (copy the labels and structure; replace values with the actual course data from the list):

**Tiêu đề**: [course title - use the real title from the list, NEVER use the slug here]
**Trình độ**: [level: Beginner / Intermediate / Advanced]
**Danh mục**: [category name]
**Giá**: [price number only, e.g. 2000000 or 0 for free - always include this from the list]

Then add the link on its own: /courses/[slug]

After this block, you may add a short sentence (e.g. "Bạn có thể xem chi tiết tại link trên." or "Nếu cần thêm thông tin, hãy cho tôi biết!").

When recommending multiple courses, use the SAME block format for EACH course: every course MUST have **Tiêu đề** (real title, not slug), **Trình độ**, **Danh mục**, **Giá** (number or 0), and /courses/[slug]. Do not output only a link or only a slug—always include the full block with title and price for each course.

If you are not recommending any specific course (e.g. general chat, no match), do not use this block format.
Respond in the same language the user writes in (e.g. Vietnamese if they write in Vietnamese).`;

function buildCoursesContext(courses: Awaited<ReturnType<typeof getAllCourses>>) {
  if (courses.length === 0) return "No courses available at the moment.";
  return courses
    .map(
      (c) =>
        `- "${c.title}" (slug: ${c.slug}) | Level: ${c.level} | Category: ${c.category?.name ?? "N/A"} | Price: ${c.price === "0" ? "Free" : c.price} | ${c.smallDescription}`
    )
    .join("\n");
}

export async function POST(req: Request) {
  if (!env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "AI assistant is not configured. Please set OPENAI_API_KEY.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { messages?: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const messages = body.messages ?? [];
  const courses = await getAllCourses();
  const coursesContext = buildCoursesContext(courses);
  const system = `${SYSTEM_PROMPT}\n\nCurrent published courses:\n${coursesContext}`;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
