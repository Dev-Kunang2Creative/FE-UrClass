import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { QuestionBankType } from "@/validators/question-bank/question-bank-validator";
import { QuestionBank } from "@/types/question-bank/question-bank";

interface CreateQuestionBankResponse {
  data: QuestionBank;
}

export const createQuestionBankHandler = async (
  body: QuestionBankType,
  token: string,
): Promise<CreateQuestionBankResponse> => {
  const formData = new FormData();

  formData.append("subtest_id", body.subtest_id);
  formData.append("question_text", body.question_text);

  if (body.question_image) {
    formData.append("question_image", body.question_image);
  }

  if (body.discussion) {
    formData.append("discussion", body.discussion);
  }

  if (body.discussion_image) {
    formData.append("discussion_image", body.discussion_image);
  }

  formData.append("correct_answer", body.correct_answer);

  if (body.difficulty) {
    formData.append("difficulty", body.difficulty);
  }

  if (body.is_active !== undefined) {
    formData.append("is_active", body.is_active ? "1" : "0");
  }

  body.options.forEach((option, index) => {
    formData.append(`options[${index}][option_key]`, option.option_key);
    formData.append(`options[${index}][option_text]`, option.option_text);
  });

  const { data } = await api.post(`/admin/question-bank`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const useCreateQuestionBank = (
  options?: UseMutationOptions<
    CreateQuestionBankResponse,
    AxiosError<CreateQuestionBankResponse>,
    { body: QuestionBankType }
  >,
) => {
  const { data: sessionData } = useSession();

  return useMutation({
    mutationFn: ({ body }) =>
      createQuestionBankHandler(body, sessionData?.access_token as string),
    ...options,
  });
};
