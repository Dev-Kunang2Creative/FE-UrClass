export interface Kelas {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  ticket_amount: number;
  wa_group_link: string | null;
  wa_consultation_number: string | null;
  meet_link: string | null;
  image: string | null;
  image_url: string | null;
  is_active: boolean;
  enrollments_count?: number;
  created_at: string;
  updated_at: string;
}

export interface KelasOrder {
  id: string;
  order_code: string;
  user_id: string;
  kelas_id: string;
  grand_total: number;
  currency: string;
  status: string;
  paid_at: string | null;
  kelas?: Kelas;
}
