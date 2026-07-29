import FormEditQuestion from "@/components/molecules/form/questions/FormUpdateQuestion";

interface DashboardAdminUpdateQuestionWrapperProps {
  id: string;
  questionId: string;
}

export default function DashboardAdminUpdateQuestionWrapper({
  id,
  questionId,
}: DashboardAdminUpdateQuestionWrapperProps) {
  return (
    <section>
      <FormEditQuestion subtestId={id} questionId={questionId} />
    </section>
  );
}
