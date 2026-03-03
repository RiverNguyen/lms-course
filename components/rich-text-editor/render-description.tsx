"use client";

import TextAlign from "@tiptap/extension-text-align";
import { type JSONContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { useMemo } from "react";
import parse from "html-react-parser";

/** Nhận TipTap JSON hoặc chuỗi HTML (mô tả có thể lưu dạng JSON hoặc HTML) */
export const RenderDescription = ({
  description,
}: {
  description: JSONContent | string;
}) => {
  const output = useMemo(() => {
    if (typeof description === "string") {
      const trimmed = description.trim();
      if (trimmed.startsWith("<")) return trimmed;
      try {
        const parsed = JSON.parse(description) as JSONContent;
        return generateHTML(parsed, [
          StarterKit,
          TextAlign.configure({
            types: ["heading", "paragraph"],
          }),
        ]);
      } catch {
        return trimmed;
      }
    }
    return generateHTML(description as JSONContent, [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ]);
  }, [description]);

  return (
    <article className="prose dark:prose-invert prose-li:marker:text-primary">
      {parse(output)}
    </article>
  );
};
