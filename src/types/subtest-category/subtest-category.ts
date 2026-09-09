export interface SubtestCategory {
  id: string;
  code: string;
  name: string;
  exam_type: "utbk" | "cpns";
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
