"use client";

import { cn } from "@/lib/utils";
import { sanitizeRichTextHtml } from "@/utils/rich-text";

interface RichTextRendererProps {
  html?: string | null;
  className?: string;
  fallback?: string;
}

export default function RichTextRenderer({
  html,
  className,
  fallback = "",
}: RichTextRendererProps) {
  const safeHtml = sanitizeRichTextHtml(html || fallback);

  if (!safeHtml) return null;

  return (
    <div
      className={cn(
        "rich-text-content text-base leading-[1.5] tracking-[0.25px] [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 [&_p]:my-2",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
