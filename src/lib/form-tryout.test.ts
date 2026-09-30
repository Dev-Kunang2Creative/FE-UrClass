import assert from "node:assert/strict";
import test from "node:test";

import { nilaiJalurTryout } from "./form-tryout.ts";

test("jalur CPNS memakai durasi SKD dan menonaktifkan IRT", () => {
  assert.deepEqual(nilaiJalurTryout("cpns"), {
    category: "CPNS",
    duration_minutes: 100,
    use_irt: false,
  });
});

test("jalur UTBK memakai durasi subtes dan selalu mengaktifkan IRT", () => {
  assert.deepEqual(nilaiJalurTryout("utbk"), {
    category: "UTBK",
    duration_minutes: null,
    use_irt: true,
  });
});
