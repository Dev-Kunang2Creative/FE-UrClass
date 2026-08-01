import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PilihKategoriWrapper from "@/components/organisms/auth/PilihKategoriWrapper";

export default async function PilihKategoriPage() {
  const session = await getServerSession(authOptions);

  if (!session) return redirect("/login");

  if (session.user?.role === "admin") return redirect("/dashboard/admin");

  return (
    <main>
      <PilihKategoriWrapper />
    </main>
  );
}
