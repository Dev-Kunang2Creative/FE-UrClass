"use client";

import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import FormCreateQuestion from "@/components/molecules/form/questions/FormCreateQuestion";
import { useGetDetailSubtest } from "@/http/subtest/get-detail-subtest";
import { useSession } from "next-auth/react";

interface DashboardAdminCreateQuestionWrapperProps {
  id: string;
}

export default function DashboardAdminCreateQuestionWrapper({
  id,
}: DashboardAdminCreateQuestionWrapperProps) {
  const { data: session } = useSession();

  const { data } = useGetDetailSubtest({
    id,
    token: session?.access_token as string,
    options: {
      enabled: !!session?.access_token,
    },
  });

  return (
    <section>
      <DashboardTitle
        title={`Tambah Soal Subtes ${data?.data.name}`}
        showBackButton
        backFallbackHref={`/dashboard/admin/subtest/${id}`}
      />
      <FormCreateQuestion id={id} />
    </section>
  );
}
