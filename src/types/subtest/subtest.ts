export interface Subtest {
  id: string;
  name: string;
  category: string;
  exam_type: "utbk" | "cpns";
  max_questions: number;
  questions_count?: number;
  // Per-subtest scoring, configurable by an admin: score_wrong can be negative,
  // which is the difference between "wrong answers cost you nothing" being true
  // and being a guess. Sent as decimal strings by MySQL through Eloquent.
  scoring_scheme?: string | null;
  score_correct?: number | string | null;
  score_wrong?: number | string | null;
  score_empty?: number | string | null;
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
