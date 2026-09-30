export type JalurTryout = "utbk" | "cpns";
export const DURASI_SKD_DEFAULT = 100;

export function nilaiJalurTryout(
  kategori: JalurTryout,
  durasiCpns = DURASI_SKD_DEFAULT,
) {
  return {
    category: kategori === "cpns" ? ("CPNS" as const) : ("UTBK" as const),
    duration_minutes: kategori === "cpns" ? durasiCpns : null,
    use_irt: kategori === "utbk",
  };
}
