import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { Question } from "@/types/questions/question";
import { QuestionType } from "@/validators/questions/question-validator";

interface CreateQuestionResponse {
  data: Question;
}

export const createQuestionHandler = async (
  id: string,
  body: QuestionType,
  token: string,
): Promise<CreateQuestionResponse> => {
  const formData = new FormData();

  formData.append("question_type", body.question_type);
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

  if (body.order_no) {
    formData.append("order_no", body.order_no.toString());
  }

  if (body.question_type === "multiple_choice" && body.correct_answer) {
    formData.append("correct_answer", body.correct_answer);
  }

  if (body.is_active !== undefined) {
    formData.append("is_active", body.is_active ? "1" : "0");
  }

  if (body.question_type === "multiple_choice") {
    body.options.forEach((option, index) => {
      formData.append(`options[${index}][option_key]`, option.option_key);
      formData.append(`options[${index}][option_text]`, option.option_text);
    });
  }

  const { data } = await api.post(`/admin/subtests/${id}/questions`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const useCreateQuestion = (
  options?: UseMutationOptions<
    CreateQuestionResponse,
    AxiosError<CreateQuestionResponse>,
    { id: string; body: QuestionType }
  >,
) => {
  const { data: sessionData } = useSession();

  return useMutation({
    mutationFn: ({ id, body }) =>
      createQuestionHandler(id, body, sessionData?.access_token as string),
    ...options,
  });
};
