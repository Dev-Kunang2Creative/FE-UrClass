export interface User {
  id: string;
  email: string;
  name: string;
  google_id?: string;
  phone_number?: string;
  email_verified_at?: string;
  password: string;
  role: "admin" | "user";
  kategori?: "utbk" | "cpns" | null;
  remember_token?: string;
  birth_date?: string;
  gender?: string;
  school_origin?: string;
  grade_level?: string;
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
  created_at: Date;
  updated_at: Date;
}
