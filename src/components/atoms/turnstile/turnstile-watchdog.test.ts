import assert from "node:assert/strict";
import test from "node:test";

import {
  TURNSTILE_WATCHDOG_TIMEOUT_MS,
  shouldMarkTurnstileStalled,
  shouldShowTurnstileGuidance,
} from "./turnstile-watchdog.ts";

test("watchdog Turnstile memakai batas waktu delapan detik", () => {
  assert.equal(TURNSTILE_WATCHDOG_TIMEOUT_MS, 8_000);
});

test("watchdog hanya menandai macet bila token dan error belum ada", () => {
  assert.equal(shouldMarkTurnstileStalled(false, false), true);
  assert.equal(shouldMarkTurnstileStalled(true, false), false);
  assert.equal(shouldMarkTurnstileStalled(false, true), false);
});

test("arahan bantuan dan tombol reset muncul saat macet atau terjadi error", () => {
  assert.equal(shouldShowTurnstileGuidance(true, false), true);
  assert.equal(shouldShowTurnstileGuidance(false, true), true);
  assert.equal(shouldShowTurnstileGuidance(true, true), true);
  assert.equal(shouldShowTurnstileGuidance(false, false), false);
});
