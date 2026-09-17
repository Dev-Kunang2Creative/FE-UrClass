export type TestimonialProgram = "UTBK-SNBT" | "CPNS";

export type TestimonialColorTheme =
  | "pink"
  | "yellow"
  | "mint"
  | "blue"
  | "lavender"
  | "cream";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  program: TestimonialProgram;
  quote: string;
  rating: number;
  avatar: string | null;
  avatar_url: string | null;
  avatar_bg: string | null;
  color_theme: TestimonialColorTheme;
  order_no: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
