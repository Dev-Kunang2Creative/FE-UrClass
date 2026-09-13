export const TURNSTILE_WATCHDOG_TIMEOUT_MS = 8_000;

export function shouldMarkTurnstileStalled(
  hasToken: boolean,
  hasError: boolean,
) {
  return !hasToken && !hasError;
}

export function shouldShowTurnstileGuidance(
  isStalled: boolean,
  hasError: boolean,
) {
  return isStalled || hasError;
}
