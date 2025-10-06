import PageHeader from "@/components/page_layout/PageHeader";
import SectionHeader from "@/components/page_layout/SectionHeader";

export default async function Home() {
  return (
    <div className="w-full h-full p-4 space-y-4">
      <PageHeader text="Dashboards" subtext="Your overview of financial health" />
      <SectionHeader text="Accounts' Balance" />
      <SectionHeader text="Monthly Overview" subtext="Incomes and expenses from July 2025" />
      <SectionHeader text="Yearly Overview" subtext="Incomes and expenses from 2025" />
      <SectionHeader text="Trend Comparison" subtext="How this month compares to average July and to average month in 2025" />
    </div>
  );
}
