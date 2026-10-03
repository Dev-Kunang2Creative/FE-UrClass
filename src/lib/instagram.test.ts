/// <reference types="node" />

import { test } from "node:test";
import assert from "node:assert/strict";

import { INSTAGRAM_REGEX, normalkanInstagram, tautanInstagram } from "./instagram.ts";

test("bentuk apa pun yang ditempel jadi username baku", () => {
  const kasus: Record<string, string> = {
    "@Nama.User": "nama.user",
    nama_user: "nama_user",
    "https://www.instagram.com/nama_user/?igsh=MWx2Ymk": "nama_user",
    "instagram.com/Nama.User": "nama.user",
    "  @juara1  ": "juara1",
    "": "",
  };

  for (const [masukan, hasil] of Object.entries(kasus)) {
    assert.equal(normalkanInstagram(masukan), hasil, `masukan: ${masukan}`);
  }
  assert.equal(normalkanInstagram(null), "");
});

test("username yang tidak mungkin ada di Instagram ditolak", () => {
  for (const buruk of ["nama..user", ".nama", "nama.", "nama user", "nama-user", "a".repeat(31)]) {
    assert.equal(INSTAGRAM_REGEX.test(buruk), false, `seharusnya ditolak: ${buruk}`);
  }
  for (const baik of ["nama.user", "nama_user", "juara1", "a".repeat(30)]) {
    assert.equal(INSTAGRAM_REGEX.test(baik), true, `seharusnya diterima: ${baik}`);
  }
});

test("tautan profil dibentuk dari username", () => {
  assert.equal(tautanInstagram("nama.user"), "https://www.instagram.com/nama.user/");
});
