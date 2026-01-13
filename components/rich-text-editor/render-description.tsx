"use client";

import TextAlign from "@tiptap/extension-text-align";
import { type JSONContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { useMemo } from "react";
import parse from "html-react-parser";

export const RenderDescription = ({
  description,
}: {
  description: JSONContent;
}) => {
  const outPut = useMemo(() => {
    return generateHTML(description, [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ]);
  }, [description]);

  return (
    <article className="prose dark:prose-invert prose-li:marker:text-primary">
      {parse(outPut)}
    </article>
  );
};
