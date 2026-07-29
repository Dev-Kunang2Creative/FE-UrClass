export type TryoutButtonVariant = "default" | "green" | "yellow";

export interface TryoutButtonState {
  label: string;
  variant: TryoutButtonVariant;
  action: "open_detail" | "start_tryout" | "retry_tryout";
}

export interface GetTryoutButtonStateParams {
  isEnrolled: boolean;
  hasAttempted: boolean;
}

/**
 * Determines the action button state for a tryout card/detail.
 *
 * - Not enrolled          → "Lihat Detail" (default) — navigate to detail page
 * - Enrolled, not started → "Mulai Kerjakan" (green)
 * - Enrolled, attempted   → "Kerjakan Ulang" (yellow)
 */
export function getTryoutButtonState({
  isEnrolled,
  hasAttempted,
}: GetTryoutButtonStateParams): TryoutButtonState {
  if (!isEnrolled) {
    return { label: "Daftar", variant: "default", action: "open_detail" };
  }

  if (!hasAttempted) {
    return { label: "Mulai Kerjakan", variant: "green", action: "start_tryout" };
  }

  return { label: "Kerjakan Ulang", variant: "yellow", action: "retry_tryout" };
}

export const TRYOUT_BUTTON_CLASS: Record<TryoutButtonVariant, string> = {
  default:
    "bg-[#004AAB] hover:bg-[#003B8A] text-white",
  green:
    "bg-green-600 hover:bg-green-700 text-white",
  yellow:
    "bg-yellow-500 hover:bg-yellow-600 text-white",
};
