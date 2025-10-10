import PageHeader from "@/components/page_layout/PageHeader";
import SectionHeader from "@/components/page_layout/SectionHeader";
import SourcesTable from "./SourcesTable";
import ProductsTable from "./ProductsTable";

export default function Settings() {
  return (
    <div className="w-full h-full p-4 space-y-4">
      <PageHeader text="Settings" subtext="Manage your details and preferences" />
      <SectionHeader text="Sources" subtext="Where your data comes from and in what form" />
      <SourcesTable />
      <SectionHeader text="Products" subtext="Your financial products and services" />
      <ProductsTable />
      <SectionHeader text="Tags" subtext="Hierarchy of your organisational tags" />
    </div>
  );
}
