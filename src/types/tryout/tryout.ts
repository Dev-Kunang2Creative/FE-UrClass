import { SubtestByTryout } from "../subtest/subtest";
import { User } from "../user/user";

export interface Tryout {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  is_free: boolean;
  use_irt: boolean;
  randomize_options: boolean;
  created_at: Date;
  updated_at: Date;
  creator: User;
  category: string;
  start_date: Date | null;
  end_date: Date | null;
  image_url: string | null;
  tryout_subtests: SubtestByTryout[];
  user_accesses_count?: number;
  user_is_enrolled?: boolean;
  user_attempt_count?: number;
  user_session_status?: "not_started" | "in_progress" | "finished" | "expired";
  user_started_at?: Date | string | null;
  user_finished_at?: Date | string | null;
  user_attempts?: TryoutAttemptHistory[];
  user_accesses?: UserTryoutAccess[];
}

export interface UserTryoutAccess {
  id: string;
  user_id: string;
  tryout_id: string;
  proof_image?: string | null;
  proof_images?: string[] | null;
  proof_image_urls?: string[];
  granted_at?: Date | string | null;
  user?: User;
  tryout_status?: string;
}

export interface TryoutAttemptHistory {
  session_id: string;
  tryout_id: string;
  attempt_number: number;
  status: "not_started" | "in_progress" | "finished" | "expired";
  started_at: Date | string | null;
  finished_at: Date | string | null;
  score: {
    raw_score: number;
    final_score: number;
    accuracy: number;
  };
  summary: {
    total_questions: number;
    answered: number;
    correct: number;
    wrong: number;
    unanswered: number;
  };
}
