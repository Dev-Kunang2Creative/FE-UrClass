"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, RemoveFormatting, Subscript, Superscript, Underline } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sanitizeRichTextHtml } from "@/utils/rich-text";

interface RichTextEditorProps {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
}

const toolbarItems = [
  { command: "bold", label: "Bold", icon: Bold },
  { command: "italic", label: "Italic", icon: Italic },
  { command: "underline", label: "Underline", icon: Underline },
  { command: "insertUnorderedList", label: "Bullet list", icon: List },
  { command: "insertOrderedList", label: "Numbered list", icon: ListOrdered },
  { command: "superscript", label: "Superscript", icon: Superscript },
  { command: "subscript", label: "Subscript", icon: Subscript },
  { command: "removeFormat", label: "Clear formatting", icon: RemoveFormatting },
] as const;

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis konten...",
  minHeightClassName = "min-h-32",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef<string | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if ((value ?? "") === lastValueRef.current) return;

    editorRef.current.innerHTML = sanitizeRichTextHtml(value);
    lastValueRef.current = value ?? "";
  }, [value]);

  const emitChange = () => {
    const nextValue = sanitizeRichTextHtml(editorRef.current?.innerHTML ?? "");
    lastValueRef.current = nextValue;
    onChange(nextValue);
  };

  const runCommand = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    emitChange();
  };

  return (
    <div className="rounded-md border border-input bg-background focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
      <div className="flex flex-wrap gap-1 border-b border-gray-100 p-2">
        {toolbarItems.map(({ command, label, icon: Icon }) => (
          <Button
            key={command}
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={label}
            aria-label={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(command)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label={placeholder}
        data-placeholder={placeholder}
        className={cn(
          "prose prose-sm max-w-none overflow-y-auto px-3 py-2 text-sm outline-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
          minHeightClassName,
        )}
        onInput={emitChange}
        onBlur={emitChange}
      />
    </div>
  );
}
