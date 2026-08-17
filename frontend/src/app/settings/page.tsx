import PageHeader from "@/components/page_layout/PageHeader";
import PhysicalProducts from "./PhysicalProducts";
import Accounts from "./Accounts";
import Investments from "./Investments";
import TagTree from "./TagTree";
import Organisations from "./Organisations";
import { Metadata } from "next";
import Section from "@/components/page_layout/Section";

export const metadata: Metadata = { title: "Settings" };

export default function Settings() {
  return (
    <>
      <PageHeader text="Settings" subtext="Manage your details and preferences" />
      <Section text="Physical Products" subtext="Cash and cards" closed>
        <PhysicalProducts />
      </Section>
      <Section text="Accounts" subtext="Bank accounts" closed>
        <Accounts />
      </Section>
      <Section text="Investments" subtext="Stock, capital and savings" closed>
        <Investments />
      </Section>
      <Section text="Tags" subtext="Hierarchy of your organisational tags" closed>
        <TagTree />
      </Section>
      <Section text="Organisations" subtext="Nice visualization of popular shops and services" closed>
        <Organisations />
      </Section>
    </>
  );
}
