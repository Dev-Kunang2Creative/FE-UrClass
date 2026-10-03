import { test } from "node:test";
import assert from "node:assert/strict";
import { kelompokJenjang } from "./jenjang.ts";

test("SMA, lulusan SMA, dan gap year sama-sama berasal dari sekolah", () => {
  for (const jenjang of ["SMA/SMK", "Lulusan SMA/SMK", "Gap Year"]) {
    assert.equal(kelompokJenjang(jenjang), "sekolah", jenjang);
  }
});

test("D3 ke atas berasal dari kampus", () => {
  for (const jenjang of ["D3", "D4", "S1", "S2"]) {
    assert.equal(kelompokJenjang(jenjang), "kampus", jenjang);
  }
});

test("pindah SMA ke S2 berganti kelompok, S1 ke S2 tidak", () => {
  // Inilah yang menentukan asal sekolah dikosongkan atau dipertahankan.
  assert.notEqual(kelompokJenjang("SMA/SMK"), kelompokJenjang("S2"));
  assert.equal(kelompokJenjang("S1"), kelompokJenjang("S2"));
  assert.equal(kelompokJenjang("SMA/SMK"), kelompokJenjang("Lulusan SMA/SMK"));
});
