import PageHeader from "@/components/page_layout/PageHeader";
import SectionHeader from "@/components/page_layout/SectionHeader";
import PhysicalProducts from "./PhysicalProducts";
import Accounts from "./Accounts";
import Investments from "./Investments";
import RecurringProducts from "./RecurringProducts";
import TagTree from "./TagTree";

export default function Settings() {
  return (
    <>
      <PageHeader text="Settings" subtext="Manage your details and preferences" />
      <SectionHeader text="Physical Products" subtext="Cash and cards" />
      <PhysicalProducts />
      <SectionHeader text="Accounts" subtext="Bank accounts" />
      <Accounts />
      <SectionHeader text="Investments" subtext="Stock, capital and savings" />
      <Investments />
      <SectionHeader text="Recurring" subtext="Monthly income and expenses" />
      <RecurringProducts />
      <SectionHeader text="Tags" subtext="Hierarchy of your organisational tags" />
      <TagTree />
    </>
  );
}
