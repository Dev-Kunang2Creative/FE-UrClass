import DashboardWrapper from "@/components/organisms/dashboard/DashboardWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role === "admin") {
    redirect("/dashboard/admin");
  }

  return (
    <main>
      <DashboardWrapper />
    </main>
  );
}
