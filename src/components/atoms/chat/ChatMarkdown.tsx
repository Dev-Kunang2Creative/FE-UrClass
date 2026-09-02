import { Fragment, type ReactNode } from "react";

/**
 * Penampil markdown seadanya untuk jawaban asisten.
 *
 * Sengaja tidak memakai pustaka markdown. Dua alasan:
 *
 * 1. Bentuk jawaban asisten sudah ditentukan persona-nya - heading, tebal,
 *    daftar bernomor, daftar butir. Menarik rantai dependensi untuk itu tidak
 *    sebanding, terutama di repo yang baru saja membersihkan CVE dua kali.
 * 2. Keamanan. Ini merender teks yang datang dari model, dan seluruhnya jadi
 *    elemen React - tidak ada dangerouslySetInnerHTML sama sekali. Jadi tidak
 *    ada jalan bagi keluaran model untuk menyuntikkan HTML atau skrip, apa pun
 *    yang ditulisnya.
 *
 * Sintaks yang tidak dikenali tampil sebagai teks biasa, bukan hilang.
 */

/** Menangani **tebal** dan `kode` di dalam satu baris. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  // Satu regex untuk kedua penanda supaya urutannya tetap terjaga.
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      out.push(text.slice(last, match.index));
    }

    const token = match[0];

    if (token.startsWith("**")) {
      out.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-bold text-slate-900">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      out.push(
        <code
          key={`${keyPrefix}-c${i}`}
          className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-slate-800"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }

    last = match.index + token.length;
    i++;
  }

  if (last < text.length) {
    out.push(text.slice(last));
  }

  return out;
}

interface ListBuffer {
  ordered: boolean;
  items: string[];
}

export default function ChatMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];

  // Daftar dikumpulkan dulu lalu dirender sebagai satu <ul>/<ol>, supaya
  // butir-butirnya tidak jadi paragraf terpisah.
  let list: ListBuffer | null = null;

  const flushList = () => {
    if (!list) return;

    const { ordered, items } = list;
    const Tag = ordered ? "ol" : "ul";

    blocks.push(
      <Tag
        key={`list-${blocks.length}`}
        className={`my-1.5 space-y-1 pl-5 ${ordered ? "list-decimal" : "list-disc"}`}
      >
        {items.map((item, index) => (
          <li key={index} className="leading-relaxed">
            {renderInline(item, `l${blocks.length}-${index}`)}
          </li>
        ))}
      </Tag>,
    );

    list = null;
  };

  lines.forEach((raw, index) => {
    const line = raw.trimEnd();

    if (line.trim() === "") {
      flushList();
      return;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      blocks.push(
        <p
          key={`h-${index}`}
          className={`mt-2.5 mb-1 first:mt-0 ${
            level <= 2
              ? "text-sm font-bold text-slate-900"
              : "text-[13px] font-bold text-slate-800"
          }`}
        >
          {renderInline(heading[2], `h${index}`)}
        </p>,
      );
      return;
    }

    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    if (bullet) {
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1]);
      return;
    }

    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (numbered) {
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(numbered[1]);
      return;
    }

    flushList();
    blocks.push(
      <p key={`p-${index}`} className="my-1 leading-relaxed first:mt-0">
        {renderInline(line, `p${index}`)}
      </p>,
    );
  });

  flushList();

  return <Fragment>{blocks}</Fragment>;
}
