import FormUpdatePackage from "@/components/molecules/form/packages/FormUpdatePackage";
import PackageTryoutManager from "@/components/molecules/packages/PackageTryoutManager";

interface DashboardAdminUpdatePackageWrapperProps {
  packageId: string;
}

export default function DashboardAdminUpdatePackageWrapper({
  packageId,
}: DashboardAdminUpdatePackageWrapperProps) {
  return (
    <section>
      <FormUpdatePackage packageId={packageId} />
      <PackageTryoutManager packageId={packageId} />
    </section>
  );
}
