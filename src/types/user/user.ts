export interface User {
  id: string;
  email: string;
  name: string;
  google_id?: string;
  phone_number?: string;
  /** Username Instagram tanpa "@", huruf kecil. Opsional. */
  instagram?: string | null;
  email_verified_at?: string;
  password: string;
  role: "admin" | "user";
  is_dummy: boolean;
  kategori?: "utbk" | "cpns" | null;
  remember_token?: string;
  birth_date?: string;
  gender?: string;
  school_origin?: string;
  grade_level?: string;
  /** Jurusan pendidikan terakhir; hanya terisi untuk jenjang D3 ke atas. */
  education_major?: string | null;
  target_university_1?: string;
  target_university_2?: string;
  target_major_1?: string;
  target_major_2?: string;
  /**
   * Sub-jalur target peserta CPNS. Menentukan pasangan field mana yang berlaku:
   * "kedinasan" memakai target_university_* dan target_major_* di atas karena
   * bentuknya sama dengan target PTN, "umum" memakai instansi dan formasi.
   */
  cpns_target_type?: "kedinasan" | "umum" | null;
  target_instansi_1?: string;
  target_formasi_1?: string;
  target_instansi_2?: string;
  target_formasi_2?: string;
  province?: string;
  city?: string;
  ticket_balance?: number;
  /**
   * Total token asisten AI yang terpakai akun ini, sesudah pengali model.
   *
   * Dihitung database sebagai subkueri pada kueri daftarnya, jadi ia selalu ada
   * di baris daftar pengguna - bernilai nol, bukan tidak ada, untuk yang belum
   * pernah memakai.
   */
  ai_total_tokens?: number;
  ai_requests?: number;
  created_at: Date;
  updated_at: Date;
}
