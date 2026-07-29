import { Subtest } from "../subtest/subtest";
import { User } from "../user/user";

export interface QuestionOption {
  id: string;
  option_key: string;
  option_text: string;
}

export interface Question {
  id: string;
  subtest_id: string;
  order_no: number;
  question_type: "multiple_choice" | "essay";
  question_text: string;
  question_image?: string | null;
  question_image_url?: string | null;
  discussion: string;
  discussion_image?: string | null;
  discussion_image_url?: string | null;
  correct_answer: string | null;
  difficulty: string;
  is_active: boolean;
  user_answers_count?: number;
  options: QuestionOption[];
  subtest: Subtest;
  creator: User;
  created_at: Date;
  updated_at: Date;
}

export interface QuestionBySubtestTryout {
  id: string;
  tryout_subtest_id: string;
  question_bank_id: string;
  order_no: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  question_bank: Question;
}
