import AccountsHistory from "@/components/dashboard/AccountsHistory";
import PageHeader from "@/components/page_layout/PageHeader";
import SectionHeader from "@/components/page_layout/SectionHeader";

export default async function Home() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  return (
    <>
      <PageHeader text="Dashboards" subtext="Your overview of financial health" />
      <SectionHeader text="Accounts' Balance" subtext={`Account's history from ${year}`} />
      <AccountsHistory year={year} />
      <SectionHeader text="Monthly Overview" subtext={`Incomes and expenses from ${month}.${year}`} />
      <SectionHeader text="Yearly Overview" subtext={`Incomes and expenses from ${year}`} />
      <SectionHeader text="Trend Comparison" subtext={`How ${month}/${year} compares to average ${month} and to average month in ${year}`} />
    </>
  );
}
