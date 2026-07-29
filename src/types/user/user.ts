export interface User {
  id: string;
  email: string;
  name: string;
  google_id?: string;
  phone_number?: string;
  email_verified_at?: string;
  password: string;
  role: "admin" | "user";
  remember_token?: string;
  birth_date?: string;
  gender?: string;
  school_origin?: string;
  grade_level?: string;
  target_university_1?: string;
  target_university_2?: string;
  target_major_1?: string;
  target_major_2?: string;
  province?: string;
  city?: string;
  ticket_balance?: number;
  created_at: Date;
  updated_at: Date;
}
