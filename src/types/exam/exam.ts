// Exam question types from BE
export interface ExamOption {
  id: string;
  option_key: string; // A, B, C, D, E
  option_text: string;
}

export interface ExamQuestion {
  id: string;
  question_type: "multiple_choice" | "essay";
  question_text: string;
  question_image: string | null;
  question_image_url: string | null;
  order_no: number;
  options: ExamOption[];
  my_answer: string | null; // A, B, C, D, E, essay HTML, or null
  correct_answer?: string | null;
  discussion?: string | null;
  discussion_image_url?: string | null;
}

export interface ExamTimerData {
  started_at: string;
  end_time: string;
  remaining_seconds: number;
  status: "in_progress" | "finished" | "expired";
}

export interface ExamData {
  tryout: {
    id: string;
    title: string;
  };
  subtest: {
    id: string;
    name: string;
    duration_minutes: number;
  };
  timer: ExamTimerData;
  questions: ExamQuestion[];
}

// Result types
export interface TryoutResultData {
  tryout_id: string;
  tryout_title: string;
  use_irt: boolean;
  attempt_number: number;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  summary: {
    total_questions: number;
    answered: number;
    correct: number;
    wrong: number;
    unanswered: number;
  };
  score_result: {
    method: "simple" | "irt";
    is_ready: boolean;
    /**
     * Benar selama skor IRT belum final. Angkanya nyata - proporsi jawaban
     * benar - tapi masih akan digantikan skor IRT setelah periode ditutup.
     */
    is_provisional?: boolean;
    raw_score: number;
    final_score: number;
    accuracy: number;
  };
  /**
   * Per-subtest scores. Optional because older cached responses predate it.
   * CPNS is judged per threshold - one subtest below its passing grade fails
   * the whole SKD - so the aggregate alone hides the deciding number.
   */
  per_subtest?: {
    subtest_id: string;
    name: string;
    exam_type: string | null;
    scheme: string;
    total_questions: number;
    answered: number;
    correct: number;
    raw_score: number;
    max_score: number;
  }[];
  irt_result: {
    is_ready: boolean;
    release_date: string | null;
    total_participants_calculated: number;
    raw_score: number;
    final_score: number;
    /** Skor sementara berbasis jawaban benar, dipakai sebelum IRT final. */
    provisional_score?: number;
  } | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  user_name: string;
  attempt_number: number;
  started_at: string | null;
  finished_at: string | null;
  summary: {
    total_questions: number;
    answered: number;
    correct: number;
    wrong: number;
    unanswered: number;
    accuracy: number;
  };
  score: {
    raw_score: number;
    final_score: number;
  };
  proof_images?: string[];
  proof_image_urls?: string[];
}

export interface TryoutLeaderboardData {
  tryout_id: string;
  tryout_title: string;
  use_irt: boolean;
  /** Peringkat memakai percobaan dengan skor tertinggi tiap peserta. */
  leaderboard_basis: "best_attempt";
  /**
   * false selama tryout IRT masih berjalan: bobot tiap soal dihitung dari
   * peserta yang sudah selesai, jadi skor dan peringkat masih bisa bergeser
   * sampai periodenya ditutup.
   */
  is_final?: boolean;
  release_date?: string | null;
  leaderboard: LeaderboardEntry[];
}

// Review types
export interface ReviewQuestion {
  question_id: string;
  subtest: {
    id: string;
    name: string;
  };
  question: {
    id: string;
    question_type: "multiple_choice" | "essay";
    question_text: string;
    question_image: string | null;
    question_image_url: string | null;
    discussion: string | null;
    discussion_image: string | null;
    discussion_image_url: string | null;
    correct_answer: string | null;
    options: ExamOption[];
  };
  my_answer: string | null;
  is_correct: boolean | null;
}

export interface ReviewData {
  tryout_id: string;
  tryout_title: string;
  attempt_number?: number;
  review: ReviewQuestion[];
}

// Session types
export interface TryoutSession {
  id: string;
  user_id: string;
  tryout_id: string;
  attempt_number: number;
  started_at: string;
  finished_at: string | null;
  status: "not_started" | "in_progress" | "finished";
  active_subtest_index?: number;
}

export interface SubtestSession {
  id: string;
  tryout_session_id: string;
  tryout_subtest_id: string;
  started_at: string;
  finished_at: string | null;
  status: "in_progress" | "finished" | "expired";
}
