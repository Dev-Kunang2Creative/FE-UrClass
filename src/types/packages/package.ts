export interface Package {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  discount_price: number | null;
  ticket_amount: number;
  currency: string;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}
