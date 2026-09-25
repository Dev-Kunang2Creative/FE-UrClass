import { test } from "node:test";
import assert from "node:assert/strict";
import {
  NAMA_REGEX,
  TELEPON_REGEX,
  keBentukInternasional,
  bagianSetelahKodeNegara,
} from "./input-rules.ts";

test("nama menolak simbol tetapi menerima nama wajar", () => {
  for (const buruk of [
    "naniek matanari@^^^^",
    "Budi & Ani",
    "Rizki$",
    'Siswa "Hebat"',
    "O'Brien",
    "Siswa123",
    " Budi",
  ]) {
    assert.equal(NAMA_REGEX.test(buruk), false, `seharusnya ditolak: ${buruk}`);
  }

  for (const baik of ["Naniek Matanari", "M. Rizki Ramadhan", "Nur-Aini", "José Mourinho"]) {
    assert.equal(NAMA_REGEX.test(baik), true, `seharusnya diterima: ${baik}`);
  }
});

test("nomor apa pun bentuknya menjadi satu bentuk baku", () => {
  for (const ditulis of [
    "081234567890",
    "+6281234567890",
    "6281234567890",
    "81234567890",
    "0812-3456-7890",
    "+62 812 3456 7890",
    "0062 812 3456 7890",
  ]) {
    assert.equal(keBentukInternasional(ditulis), "+6281234567890", `gagal untuk: ${ditulis}`);
  }

  assert.equal(keBentukInternasional(""), "");
  assert.equal(keBentukInternasional(null), "");
  assert.equal(keBentukInternasional("bukan angka"), "");
});

test("bentuk baku menolak nomor yang bukan nomor ponsel", () => {
  // Persis kasus di tangkapan layar: deretan angka tanpa batas.
  assert.equal(TELEPON_REGEX.test(keBentukInternasional("123456789444444444444444444444")), false);
  // Nomor rumah berawalan kode area - tidak bisa dihubungi lewat WhatsApp.
  assert.equal(TELEPON_REGEX.test(keBentukInternasional("0211234567")), false);
  // Terlalu pendek.
  assert.equal(TELEPON_REGEX.test(keBentukInternasional("08123")), false);

  assert.equal(TELEPON_REGEX.test("+6281234567890"), true);
});

test("bagian setelah kode negara dipakai kolom berprefiks", () => {
  assert.equal(bagianSetelahKodeNegara("081234567890"), "81234567890");
  assert.equal(bagianSetelahKodeNegara(""), "");
});
