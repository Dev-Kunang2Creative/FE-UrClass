/// <reference types="node" />

import test from 'node:test';
import assert from 'node:assert/strict';

import { makeUpdateProfileSchema } from './update-profile-validator.ts';

// phone_number sudah dalam bentuk baku: kolom di FormCompleteProfile
// menormalkan apa pun yang diketik sebelum nilainya sampai ke skema ini.
const profil = {
  name: 'Peserta', phone_number: '+6281234567890', grade_level: 'Gap Year',
  school_origin: 'SMA', gender: 'L', birth_date: '2000-01-01',
  cpns_target_type: 'kedinasan', target_university_1: 'IPDN',
};

test('Kedinasan menerima jurusan kosong dan null, tetapi sekolah tetap wajib', () => {
  const schema = makeUpdateProfileSchema(false, false, 'kedinasan');
  assert.equal(schema.safeParse(profil).success, true);
  assert.equal(schema.safeParse({ ...profil, target_major_1: null, target_major_2: null }).success, true);
  assert.equal(schema.safeParse({ ...profil, target_university_1: '' }).success, false);
});

test('UTBK tetap mewajibkan jurusan', () => {
  assert.equal(makeUpdateProfileSchema(true).safeParse(profil).success, false);
});

test('Nama bersimbol dan nomor HP di luar bentuk baku ditolak', () => {
  const schema = makeUpdateProfileSchema(false, false, 'kedinasan');

  // Persis yang lolos sebelum batasan ini ada.
  assert.equal(schema.safeParse({ ...profil, name: 'naniek matanari@^^^^' }).success, false);
  assert.equal(schema.safeParse({ ...profil, name: 'Siswa123' }).success, false);
  assert.equal(schema.safeParse({ ...profil, phone_number: '123456789444444444444444444444' }).success, false);
  assert.equal(schema.safeParse({ ...profil, phone_number: '081234567890' }).success, false);

  assert.equal(schema.safeParse({ ...profil, name: 'M. Rizki Ramadhan' }).success, true);
});

test('Admin tetap dilonggarkan kecuali namanya', () => {
  // Admin tidak punya nomor HP wajib, tapi namanya tetap tidak boleh bersimbol.
  const admin = makeUpdateProfileSchema(false, true);

  assert.equal(admin.safeParse({ name: 'Admin UrClass' }).success, true);
  assert.equal(admin.safeParse({ name: 'Admin@^^^' }).success, false);
});
