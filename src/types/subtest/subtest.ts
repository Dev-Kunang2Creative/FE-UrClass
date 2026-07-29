export interface Subtest {
  id: string;
  name: string;
  category: string;
  max_questions: number;
  questions_count?: number;
  created_at: Date;
  updated_at: Date;
}

export interface SubtestByTryout {
  id: string;
  tryout_id: string;
  subtest_id: string;
  duration_minutes: number;
  order_no: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  subtest: Subtest;
}
