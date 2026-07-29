"use client";

import CardQuestionDetail from "@/components/molecules/card/question/CardQuestionDetail";
import { useGetDetailQuestion } from "@/http/questions/get-detail-question";
import { useSession } from "next-auth/react";

interface DashboardAdminDetailQuestionBySubtestWrapperProps {
  subtestId: string;
  questionId: string;
}

export default function DashboardAdminDetailQuestionBySubtestWrapper({
  subtestId,
  questionId,
}: DashboardAdminDetailQuestionBySubtestWrapperProps) {
  const { data: session } = useSession();

  const { data, isPending } = useGetDetailQuestion({
    id: subtestId,
    questionId,
    token: session?.access_token as string,
  });

  return (
    <section>
      <CardQuestionDetail data={data?.data} isPending={isPending} />
    </section>
  );
}
