import assert from "node:assert/strict";
import test from "node:test";

import { isRouteActive } from "./navigation.ts";

test("route aktif untuk halaman yang sama dan turunannya", () => {
  assert.equal(
    isRouteActive("/dashboard/admin/subtest", "/dashboard/admin/subtest"),
    true,
  );
  assert.equal(
    isRouteActive(
      "/dashboard/admin/subtest/123/edit",
      "/dashboard/admin/subtest",
    ),
    true,
  );
});

test("route dengan awalan teks sama bukan turunan menu", () => {
  assert.equal(
    isRouteActive(
      "/dashboard/admin/subtest-category",
      "/dashboard/admin/subtest",
    ),
    false,
  );
  assert.equal(
    isRouteActive(
      "/dashboard/admin/transactions-archive",
      "/dashboard/admin/transactions",
    ),
    false,
  );
});
