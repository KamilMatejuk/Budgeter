import { Source } from "@/types/backend";
import { get } from "../api/fetch";
import ErrorToast from "@/components/toast/ErrorToast";
import { SourceProvider } from "@/components/import/ImportContext";
import SourceSelector from "@/components/import/SourceSelector";
import SourceImporter from "@/components/import/SourceImporter";
import RunButton from "@/components/import/RunButton";
import PageHeader from "@/components/page_layout/PageHeader";
import SectionHeader from "@/components/page_layout/SectionHeader";

export default async function Import() {
  const { response: sources, error } = await get<Source[]>("/api/source");

  return (
    <div className="w-full h-full p-4 space-y-4">
      <PageHeader text="Import" subtext="Load report from your preferred source" />
      <SourceProvider>
        <SectionHeader text="Select Source" />
        {error ? <ErrorToast message="Could not download sources" /> : <SourceSelector sources={sources} />}
        <SectionHeader text="Select File" />
        <SourceImporter />
        <RunButton />
      </SourceProvider>
    </div>
  );
}
