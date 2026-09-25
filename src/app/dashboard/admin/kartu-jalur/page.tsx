import DashboardTitle from "@/components/atoms/typography/DashboardTitle";
import DashboardAdminTrackCardWrapper from "@/components/organisms/dashboard/admin/track-card/DashboardAdminTrackCardWrapper";

export default function DashboardAdminKartuJalurPage() {
  return (
    <main>
      <DashboardTitle title="Kartu Pemilihan Jalur" />
      <DashboardAdminTrackCardWrapper />
    </main>
  );
}
