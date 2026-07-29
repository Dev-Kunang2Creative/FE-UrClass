import FormEditTryout from "@/components/molecules/form/tryout/FormUpdateTryout";

interface DashboardAdminUpdateTryoutWrapperProps {
  id: string;
}

export default function DashboardAdminUpdateTryoutWrapper({
  id,
}: DashboardAdminUpdateTryoutWrapperProps) {
  return (
    <section>
      <FormEditTryout tryoutId={id} />
    </section>
  );
}
