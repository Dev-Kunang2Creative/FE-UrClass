import type { Kategori } from "@/lib/kategori";
import type { SubtestByTryout } from "@/types/subtest/subtest";

export interface SubtestSummary {
  name: string;
  questions: number;
  duration: number;
  category: string;
}

export interface SubtestGroup {
  category: string;
  label: string;
  items: SubtestSummary[];
  questions: number;
  duration: number;
}

/**
 * Headings for the subtest groups, per track.
 *
 * subtests.category is an enum of only TPS|Literasi, so the three SKD subtests
 * are stored as "TPS" - which meant a CPNS candidate was shown "Tes Potensi
 * Skolastik (TPS)", a UTBK term, above their TWK/TIU/TKP. Widening the enum is
 * the real fix, but the exam flow branches on category === "TPS", so the
 * correction belongs here for now.
 *
 * Unknown categories fall back to their own value rather than an invented
 * name: showing "Literasi" is honest, guessing is not.
 */
const GROUP_LABEL: Record<Kategori, Partial<Record<string, string>>> = {
  utbk: { TPS: "Tes Potensi Skolastik (TPS)", Literasi: "Tes Literasi" },
  cpns: { TPS: "Seleksi Kompetensi Dasar (SKD)", SKD: "Seleksi Kompetensi Dasar (SKD)" },
};

/**
 * Groups a tryout subtests by category, in first-seen order.
 *
 * Shared by the tryout detail page and the pre-exam instructions, which used to
 * group and label them separately - the second with a nested ternary over
 * TPS/Literasi/SKD - so the same tryout could be described two ways on two
 * consecutive screens.
 */
export function groupSubtests(
  subtests: SubtestSummary[],
  kategori: Kategori,
): SubtestGroup[] {
  const order: string[] = [];
  for (const subtest of subtests) {
    if (!order.includes(subtest.category)) order.push(subtest.category);
  }

  return order.map((category) => {
    const items = subtests.filter((subtest) => subtest.category === category);
    return {
      category,
      label: GROUP_LABEL[kategori][category] ?? category,
      items,
      questions: items.reduce((sum, item) => sum + item.questions, 0),
      duration: items.reduce((sum, item) => sum + item.duration, 0),
    };
  });
}

/**
 * Turns the tryout_subtests payload into what the screens display.
 *
 * The question count comes from questions_count, the number of active questions
 * that exist, falling back to max_questions only when the count is absent.
 * The two pages disagreed on this: the detail page read max_questions and
 * announced "160 soal" while the instructions screen read questions_count and
 * said 19 - for the same tryout, one click apart. max_questions is the target
 * an admin configured; questions_count is what the reader will actually be
 * asked. Promising the first and delivering the second is the worse error.
 */
export function summariseSubtests(
  tryoutSubtests: SubtestByTryout[] | undefined,
  fallbackCategory: string,
): SubtestSummary[] {
  return (tryoutSubtests ?? [])
    .slice()
    .sort((a, b) => a.order_no - b.order_no)
    .map((entry) => {
      const rawName = entry.subtest.name;
      return {
        // Seeded names carry a track prefix, as in "utbk_Penalaran Umum".
        name: rawName.includes("_")
          ? rawName.split("_").slice(1).join("_")
          : rawName,
        questions: entry.subtest.questions_count ?? entry.subtest.max_questions ?? 0,
        duration: entry.duration_minutes || 0,
        category: entry.subtest.category || fallbackCategory,
      };
    });
}
