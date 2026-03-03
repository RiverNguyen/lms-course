"use client";

import { Menubar } from "@/components/rich-text-editor/menubar";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { ControllerRenderProps, FieldValues, FieldPath } from "react-hook-form";
import { useEffect } from "react";

/** Parses value as Tiptap content: accepts JSON (ProseMirror) or HTML string. */
function parseEditorContent(value: string | undefined): string | object {
  if (!value?.trim()) return "<p>Hello World</p>";
  const trimmed = value.trim();
  if (trimmed.startsWith("<")) return trimmed;
  try {
    return JSON.parse(value) as object;
  } catch {
    return trimmed;
  }
}

export const RichTextEditor = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  field,
  disabled,
}: {
  field: ControllerRenderProps<TFieldValues, TName>;
  disabled?: boolean;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    immediatelyRender: false,
    content: parseEditorContent(field.value),
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert !w-full !max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      field.onChange(JSON.stringify(editor.getJSON()));
    },
  });

  // Update editor content when field.value changes externally (e.g., from AI)
  useEffect(() => {
    if (!editor) return;

    try {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = field.value ?? "";

      // Only update if content actually changed (avoid infinite loops)
      if (newContent && currentContent !== newContent) {
        const parsedContent = parseEditorContent(newContent);
        editor.commands.setContent(parsedContent);
      }
    } catch (error) {
      console.error("Failed to parse editor content:", error);
      editor.commands.setContent({ type: "doc", content: [{ type: "paragraph" }] });
    }
  }, [field.value, editor]);

  return (
    <div className="w-full border border-input rounded-lg overflow-hidden dark:bg-input/30">
      <Menubar editor={editor} disabled={disabled ?? false} />
      <EditorContent editor={editor} disabled={disabled ?? false} />
    </div>
  );
};
