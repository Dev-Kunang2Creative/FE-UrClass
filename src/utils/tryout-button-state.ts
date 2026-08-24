export type TryoutButtonVariant = "default" | "green" | "yellow";

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
}

/**
 * Determines the action button state for a tryout card/detail.
 *
 * - Not enrolled           → "Daftar" (default)
 * - Enrolled, in progress  → "Lanjutkan" (yellow) — resumes, never restarts
 * - Enrolled, not started  → "Mulai Kerjakan" (green)
 * - Enrolled, attempted    → "Kerjakan Ulang" (yellow)
 */
export function getTryoutButtonState({
  isEnrolled,
  hasAttempted,
  sessionStatus,
}: GetTryoutButtonStateParams): TryoutButtonState {
  if (!isEnrolled) {
    return { label: "Daftar", variant: "default", action: "open_detail" };
  }

  // Checked before hasAttempted: an in-progress session satisfies both, and
  // resuming must win over offering a restart.
  if (sessionStatus === "in_progress") {
    return { label: "Lanjutkan", variant: "yellow", action: "resume_tryout" };
  }

  if (!hasAttempted) {
    return { label: "Mulai Kerjakan", variant: "green", action: "start_tryout" };
  }

  return { label: "Kerjakan Ulang", variant: "yellow", action: "retry_tryout" };
}

export const TRYOUT_BUTTON_CLASS: Record<TryoutButtonVariant, string> = {
  default:
    "bg-primary hover:bg-primary/90 text-white",
  green:
    "bg-green-600 hover:bg-green-700 text-white",
  yellow:
    "bg-yellow-500 hover:bg-yellow-600 text-white",
};
