import test from 'node:test';
import assert from 'node:assert/strict';
import { makeUpdateProfileSchema } from './update-profile-validator.ts';

const profil = {
  name: 'Peserta', phone_number: '081234567890', grade_level: 'Gap Year',
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
