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
  /** Target jalur CPNS: instansi dan formasi yang dituju pelamar. */
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
