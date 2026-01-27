import { SectionCards } from "@/components/sidebar/section-cards";
import { ChartsWrapper } from "@/components/sidebar/charts-wrapper";


const AdminIndexPage = async () => {
  return (
    <div className="space-y-6">
      <SectionCards />
      <ChartsWrapper />
    </div>
  );
};

export default AdminIndexPage;
