import FormUpdateSubtest from "@/components/molecules/form/subtest/FormUpdateSubtest";

interface DashboardAdminUpdateSubtestWrapperProps {
  subtestId: string;
}

export default function DashboardAdminUpdateSubtestWrapper({
  subtestId,
}: DashboardAdminUpdateSubtestWrapperProps) {
  return (
    <section>
      <FormUpdateSubtest subtestId={subtestId} />
    </section>
  );
}
