import AccountsHistory from "@/components/dashboard/AccountsHistory";
import Debt from "@/components/dashboard/Debt";
import Requirements from "@/components/dashboard/Requirements";
import MultiColumnSection from "@/components/page_layout/MultiColumnSection";
import PageHeader from "@/components/page_layout/PageHeader";
import SectionHeader from "@/components/page_layout/SectionHeader";
import { getMonthName } from "@/const/date";

export default async function Home() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  return (
    <>
      <PageHeader text="Dashboards" subtext="Your overview of financial health" />
      <MultiColumnSection>
        <>
          <SectionHeader text="This Month Requirements" subtext={`Requirements of cards and accounts in ${getMonthName(month)} ${year}`} />
          <Requirements />
        </>
        <>
          <SectionHeader text="Debt" subtext={"Money owed and outstanding balances"} />
          <Debt />
        </>
      </MultiColumnSection>
      <SectionHeader text="Accounts' Balance" subtext={`Account's value history`} />
      <AccountsHistory />
      <SectionHeader text="Monthly Overview" subtext={`Incomes and expenses from ${month}.${year}`} />
      <SectionHeader text="Yearly Overview" subtext={`Incomes and expenses from ${year}`} />
      <SectionHeader text="Trend Comparison" subtext={`How ${month}/${year} compares to average ${month} and to average month in ${year}`} />
    </>
  );
}
