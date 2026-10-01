import assert from "node:assert/strict";
import test from "node:test";

import { isRouteActive, shouldShowTicketBadge } from "./navigation.ts";

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

test("tiket badge hanya muncul untuk peserta dan di luar rute admin", () => {
  assert.equal(shouldShowTicketBadge("user", "/dashboard"), true);
  assert.equal(shouldShowTicketBadge("user", "/dashboard/try-out"), true);
  assert.equal(shouldShowTicketBadge("admin", "/dashboard/admin"), false);
  assert.equal(
    shouldShowTicketBadge("admin", "/dashboard/admin/try-out/create"),
    false,
  );
  assert.equal(shouldShowTicketBadge("admin", "/dashboard"), false);
  assert.equal(shouldShowTicketBadge("user", "/dashboard/admin"), false);
  assert.equal(
    shouldShowTicketBadge("user", "/dashboard/admin/subtest"),
    false,
  );
  assert.equal(
    shouldShowTicketBadge(undefined, "/dashboard/admin/try-out"),
    false,
  );
  assert.equal(shouldShowTicketBadge(undefined, "/dashboard"), true);
});

