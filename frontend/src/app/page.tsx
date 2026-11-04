// import AccountsHistory from "@/components/dashboard/AccountsHistory";
import Debt from "@/components/dashboard/Debt";
import IncomExpenseHistory from "@/components/dashboard/IncomeExpenseHistory";
import TagTrend from "@/components/dashboard/TagTrend";
import Requirements from "@/components/dashboard/Requirements";
import MultiColumnSection from "@/components/page_layout/MultiColumnSection";
import PageHeader from "@/components/page_layout/PageHeader";
import SectionHeader from "@/components/page_layout/SectionHeader";
import { getMonthName } from "@/const/date";
import { Metadata } from "next";
import Budget from "@/components/dashboard/Budget";
import Loader from "@/components/Loader";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Budgeter",
  description: "Helps you manage your budget effectively",
};

export default async function Home() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  return (
    <>
      <PageHeader text="Dashboards" subtext="Your overview of financial health" />
      <MultiColumnSection mobileBehaviour="wrap">
        <>
          <SectionHeader text="This Month Requirements" subtext={`Requirements of cards and accounts in ${getMonthName(month)} ${year}`} />
          <Suspense fallback={<Loader />}><Requirements /></Suspense>
        </>
        <>
          <SectionHeader text="Debt" subtext="Money owed and outstanding balances" />
          <Suspense fallback={<Loader />}><Debt /></Suspense>
        </>
      </MultiColumnSection>
      {/* Temporarly hide */}
      {/* <SectionHeader text="Accounts' Balance" subtext={`Accounts value history`} /> */}
      {/* <AccountsHistory /> */}
      <SectionHeader text="Monthly Overview" subtext="Incomes and expenses (without outliers)" />
      <Suspense fallback={<Loader />}><IncomExpenseHistory /></Suspense>
      <SectionHeader text="Budget" subtext="How much of your budget you've used so far this month (without outliers)" />
      <Suspense fallback={<Loader />}><Budget /></Suspense>
      <SectionHeader text="Tag Trend" subtext="How your tags trend (without outliers)" />
      <Suspense fallback={<Loader />}><TagTrend /></Suspense>
    </>
  );
}
