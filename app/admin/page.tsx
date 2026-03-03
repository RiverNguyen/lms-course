import { ExportStatsDropdown } from "@/app/admin/_components/export-stats-dropdown";
import { SectionCards } from "@/components/sidebar/section-cards";
import { ChartsWrapper } from "@/components/sidebar/charts-wrapper";

const AdminIndexPage = async () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tổng quan
        </h1>
        <ExportStatsDropdown />
      </div>
      <SectionCards />
      <ChartsWrapper />
    </div>
  );
};

export default AdminIndexPage;
