"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Bot, Loader2, Send, Sparkles, BookOpen, GraduationCap, Tag, Coins, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface CourseInfo {
  title?: string;
  level?: string;
  category?: string;
  price?: string;
  slug?: string;
}

function parseCourseInfo(text: string): { courseInfo: CourseInfo | null; remainingText: string } {
  // 1) Format chuẩn: **Tiêu đề**, **Trình độ**, **Danh mục**, **Giá** + /courses/slug
  const titleMatch = text.match(/-?\s*\*\*Tiêu đề\*\*[:\s]+(.+?)(?:\n|$)/i);
  const levelMatch = text.match(/-?\s*\*\*Trình độ\*\*[:\s]+(.+?)(?:\n|$)/i);
  const categoryMatch = text.match(/-?\s*\*\*Danh mục\*\*[:\s]+(.+?)(?:\n|$)/i);
  const priceMatch = text.match(/-?\s*\*\*Giá\*\*[:\s]+(.+?)(?:\n|$)/i);
  const slugMatch = text.match(/\/courses\/([^\s\)\n\)]+)/i);

  const courseInfo: CourseInfo = {};
  if (titleMatch) courseInfo.title = titleMatch[1].trim();
  if (levelMatch) courseInfo.level = levelMatch[1].trim();
  if (categoryMatch) courseInfo.category = categoryMatch[1].trim();
  if (priceMatch) courseInfo.price = priceMatch[1].trim().replace(/\D/g, "") || priceMatch[1].trim();
  if (slugMatch) courseInfo.slug = slugMatch[1].trim();

  const hasStructuredBlock = titleMatch ?? levelMatch ?? categoryMatch;

  // 2) Fallback: câu tự nhiên (VD: "khóa học **"Tên"**", "chuyên ngành **X**", "Giá ... VNĐ", /courses/slug)
  if (!hasStructuredBlock) {
    const slugFallback = text.match(/\/courses\/([^\s\)\n\)]+)/i);
    if (slugFallback) courseInfo.slug = slugFallback[1].trim();
    const titleNatural = text.match(/(?:khóa học|course)\s*\*\*["']?(.+?)["']?\*\*|tham gia\s+(?:khóa học\s+)?\*\*["']?(.+?)["']?\*\*/i)
      ?? text.match(/\*\*["']([^"']+)["']\*\*/);
    if (titleNatural) courseInfo.title = (titleNatural[1] ?? titleNatural[2] ?? titleNatural[0]?.replace(/\*\*["']?|["']?\*\*/g, "") ?? "").trim();
    const categoryNatural = text.match(/(?:chuyên ngành|danh mục|thuộc\s+(?:chuyên\s+)?ngành)\s*\*\*(.+?)\*\*/i);
    if (categoryNatural) courseInfo.category = categoryNatural[1].trim();
    const numPart = text.match(/(\d[\d.,]*)\s*VNĐ/i);
    if (numPart) courseInfo.price = numPart[1].replace(/[.,]/g, "");
    if (/\b(?:miễn phí|free)\b/i.test(text) && !courseInfo.price) courseInfo.price = "0";
  }

  // Chỉ trả về card khi có ít nhất tiêu đề hoặc slug (để có link)
  if (!courseInfo.title && !courseInfo.slug) return { courseInfo: null, remainingText: text };

  // Chuẩn hóa giá: nếu đang là số có dấu chấm/phẩy nghìn thì giữ nguyên số
  if (courseInfo.price && /^[\d.,]+$/.test(courseInfo.price.replace(/\.|,/g, ""))) {
    courseInfo.price = courseInfo.price.replace(/[.,]/g, "");
  }

  // Remove course info block from text (format chuẩn)
  let remainingText = text;
  const courseBlockStart = text.search(/-?\s*\*\*Tiêu đề\*\*/i);
  if (courseBlockStart !== -1) {
    const afterBlock = text.substring(courseBlockStart);
    const blockEndMatch = afterBlock.match(/([\s\S]+?)(?=\n\n|\n[^\*\-\s]|$)/);
    if (blockEndMatch) {
      const blockLength = blockEndMatch[0].length;
      remainingText = (
        text.substring(0, courseBlockStart) +
        text.substring(courseBlockStart + blockLength)
      ).trim();
    }
  } else if (courseInfo.slug) {
    // Fallback: không có block chuẩn nhưng có slug → xóa /courses/slug để vòng lặp tiến
    remainingText = text.replace(new RegExp(`/courses/${escapeRegex(courseInfo.slug)}(?=\\s|$|\\n|\\))`, "i"), "").trim();
  }

  return { courseInfo, remainingText };
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Chuyển slug thành tiêu đề đọc được (fallback khi AI chỉ trả về slug) */
function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/** Parse toàn bộ khóa học trong đoạn text, trả về mảng courses và phần text còn lại (intro, v.v.) */
function parseAllCourses(text: string): { courses: CourseInfo[]; remainingText: string } {
  const courses: CourseInfo[] = [];
  let current = text;
  const maxIterations = 50; // tránh vòng lặp vô hạn khi parse lỗi
  let iterations = 0;
  while (iterations < maxIterations) {
    iterations += 1;
    const { courseInfo, remainingText } = parseCourseInfo(current);
    if (!courseInfo || (!courseInfo.title && !courseInfo.slug)) break;
    courses.push(courseInfo);
    // Nếu remainingText không đổi thì thoát để tránh đơ web
    if (remainingText === current) break;
    current = remainingText;
  }
  return { courses, remainingText: current };
}

function CourseCard({ course }: { course: CourseInfo }) {
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-foreground">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20">
            <BookOpen className="size-4 text-primary" />
          </div>
          <span className="line-clamp-2">
            {course.title || (course.slug ? slugToTitle(course.slug) : "Khóa học")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 pt-0">
        {course.level && (
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="size-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground shrink-0">Trình độ:</span>
            <Badge variant="secondary" className="text-xs">
              {course.level}
            </Badge>
          </div>
        )}
        {course.category && (
          <div className="flex items-center gap-2 text-sm">
            <Tag className="size-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground shrink-0">Danh mục:</span>
            <span className="font-medium">{course.category}</span>
          </div>
        )}
        {course.price && (
          <div className="flex items-center gap-2 text-sm">
            <Coins className="size-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground shrink-0">Giá:</span>
            <span className="font-semibold text-primary">
              {course.price === "0" || parseFloat(course.price) === 0
                ? "Miễn phí"
                : new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(parseFloat(course.price))}
            </span>
          </div>
        )}
        {course.slug && (
          <Link
            href={`/courses/${course.slug}`}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline mt-3 pt-3 border-t border-primary/20 transition-colors font-medium"
          >
            <span>Xem chi tiết khóa học</span>
            <ExternalLink className="size-3.5" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

/** Loại bỏ khóa học trùng lặp theo slug hoặc title */
function deduplicateCourses(courses: CourseInfo[]): CourseInfo[] {
  const seen = new Set<string>();
  return courses.filter((c) => {
    const key = (c.slug ?? c.title ?? "").trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function MessageContent({ text }: { text: string }) {
  const { courses, remainingText } = parseAllCourses(text);
  const uniqueCourses = deduplicateCourses(courses);

  const [enriched, setEnriched] = useState<Record<string, Partial<CourseInfo>>>({});

  const slugsToEnrich = useMemo(
    () =>
      uniqueCourses
        .filter((c) => c.slug && (!c.title || !c.price))
        .map((c) => c.slug!),
    [uniqueCourses]
  );

  useEffect(() => {
    if (slugsToEnrich.length === 0) return;
    const controller = new AbortController();
    let cancelled = false;
    Promise.all(
      slugsToEnrich.map((slug) =>
        fetch(`/api/courses/by-slug?slug=${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => ({ slug, data }))
      )
    )
      .then((results) => {
        if (cancelled) return;
        setEnriched((prev) => {
          const next = { ...prev };
          results.forEach(({ slug, data }) => {
            if (data)
              next[slug] = {
                title: data.title,
                level: data.level,
                category: data.category,
                price: data.price ?? "0",
              };
          });
          return next;
        });
      })
      .catch((err) => {
        if (err?.name !== "AbortError") throw err;
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [slugsToEnrich.join(",")]);

  const mergedCourses = useMemo(
    () =>
      uniqueCourses.map((c) =>
        c.slug && enriched[c.slug]
          ? { ...c, ...enriched[c.slug] }
          : c
      ),
    [uniqueCourses, enriched]
  );

  return (
    <div className="space-y-3">
      {mergedCourses.map((course, i) => (
        <CourseCard key={`${course.slug ?? course.title ?? i}-${i}`} course={course} />
      ))}
      {remainingText.trim() && (
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {remainingText}
        </div>
      )}
    </div>
  );
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>('input[name="message"]');
    const text = input?.value?.trim();
    if (text && input) {
      sendMessage({ text });
      input.value = "";
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-6 right-8 z-[50] size-14 rounded-full shadow-lg transition-transform hover:scale-105"
        aria-label="Mở Trợ lý AI"
      >
        <Sparkles className="size-7" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col border-l p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="flex items-center gap-2">
              <Bot className="size-5 text-primary" />
              Trợ lý AI
            </SheetTitle>
            <p className="text-muted-foreground text-sm font-normal">
              Hỏi về khóa học, gợi ý học tập hoặc thông tin về TunaLMS
            </p>
          </SheetHeader>

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 py-8 text-center text-sm text-muted-foreground">
                  <Sparkles className="size-8 opacity-50" />
                  <p>Chào bạn! Bạn muốn tìm khóa học nào?</p>
                  <p className="text-xs">
                    Ví dụ: &quot;Gợi ý khóa lập trình cho người mới&quot;,
                    &quot;Khóa học miễn phí&quot;
                  </p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="size-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.parts?.map((part, i) => {
                      if ("text" in part && typeof part.text === "string") {
                        return (
                          <MessageContent
                            key={`${message.id}-${i}`}
                            text={part.text}
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="size-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-2.5">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-muted-foreground text-sm">
                      Đang suy nghĩ...
                    </span>
                  </div>
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                  {error.message}
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex gap-2 border-t bg-background p-4"
            >
              <Input
                name="message"
                placeholder="Nhập câu hỏi của bạn..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="size-4" />
                <span className="sr-only">Gửi</span>
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
