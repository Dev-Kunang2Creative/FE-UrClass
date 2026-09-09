export type TryoutButtonVariant = "primary" | "outline";

export interface TryoutButtonState {
  label: string;
  variant: TryoutButtonVariant;
  action: "open_detail" | "start_tryout" | "retry_tryout" | "resume_tryout";
}

export interface GetTryoutButtonStateParams {
  isEnrolled: boolean;
  hasAttempted: boolean;
  /**
   * Optional so existing callers keep working. Without it an unfinished
   * session is indistinguishable from a finished one, and the button reads
   * "Kerjakan Ulang" - which tells someone mid-exam to start over.
   */
  sessionStatus?: "not_started" | "in_progress" | "finished" | "expired";
  /**
   * Satu tiket berlaku untuk satu kali pengerjaan, jadi mengulang tryout
   * premium memotong tiket lagi. Harganya disebut di tombolnya, bukan baru
   * ketahuan setelah saldo berkurang. Opsional supaya pemanggil lama tetap
   * jalan; tanpa nilai ini tombolnya tidak menyebut harga apa pun.
   */
  isFree?: boolean;
}

/**
 * Determines the action button state for a tryout card/detail.
 *
 * - Not enrolled           → "Daftar"
 * - Enrolled, in progress  → "Lanjutkan" — resumes, never restarts
 * - Enrolled, not started  → "Mulai Kerjakan"
 * - Enrolled, attempted    → "Kerjakan Ulang" (outlined, 1 tiket kalau premium)
 */
export function getTryoutButtonState({
  isEnrolled,
  hasAttempted,
  sessionStatus,
  isFree,
}: GetTryoutButtonStateParams): TryoutButtonState {
  if (!isEnrolled) {
    return { label: "Daftar", variant: "primary", action: "open_detail" };
  }

  // Checked before hasAttempted: an in-progress session satisfies both, and
  // resuming must win over offering a restart.
  if (sessionStatus === "in_progress") {
    return { label: "Lanjutkan", variant: "primary", action: "resume_tryout" };
  }

  if (!hasAttempted) {
    return { label: "Mulai Kerjakan", variant: "primary", action: "start_tryout" };
  }

  return {
    label: isFree === false ? "Kerjakan Ulang (1 Tiket)" : "Kerjakan Ulang",
    variant: "outline",
    action: "retry_tryout",
  };
}

/**
 * Two tiers, both on the reader's track palette.
 *
 * The variants used to be named after colours - green for "Mulai Kerjakan",
 * yellow for the repeat states - which put a green and a yellow button on a
 * page themed orange or blue, and bg-yellow-500 with white text sits near
 * 2:1 contrast. Anything that moves the reader forward is now the track
 * colour; only "Kerjakan Ulang" is outlined, because redoing something
 * already finished is worth less than starting something new.
 */
export const TRYOUT_BUTTON_CLASS: Record<TryoutButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:brightness-95",
  outline:
    "border-2 border-slate-900 bg-white text-slate-900 hover:bg-track-tint",
};
