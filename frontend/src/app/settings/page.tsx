import PageHeader from "@/components/page_layout/PageHeader";
import SectionHeader from "@/components/page_layout/SectionHeader";
import PhysicalProducts from "./PhysicalProducts";
import Accounts from "./Accounts";
import Investments from "./Investments";
import TagTree from "./TagTree";
import Organisations from "./Organisations";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

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
      <SectionHeader text="Tags" subtext="Hierarchy of your organisational tags" />
      <TagTree />
      <SectionHeader text="Organisations" subtext="Nice visualization of popular shops and services" />
      <Organisations />
    </>
  );
}
