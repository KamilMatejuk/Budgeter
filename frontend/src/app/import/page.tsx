import { SourceWithId } from "@/types/backend";
import { get } from "../api/fetch";
import ErrorToast from "@/components/toast/ErrorToast";
import { SourceProvider } from "@/app/import/ImportContext";
import SourceSelector from "@/app/import/SourceSelector";
import SourceImporter from "@/app/import/SourceImporter";
import RunButton from "@/app/import/RunButton";
import PageHeader from "@/components/page_layout/PageHeader";
import SectionHeader from "@/components/page_layout/SectionHeader";
import WarningToast from "@/components/toast/WarningToast";

export default async function Import() {
  const { response: sources, error } = await get<SourceWithId[]>("/api/source");

  return (
    <>
      <PageHeader text="Import" subtext="Load report from your preferred source" />
      <SourceProvider>
        <SectionHeader text="Select Source" />
        {error
          ? <ErrorToast message="Could not download sources" />
          : sources.length == 0
            ? <WarningToast message="No sources available. Please add a source." />
            : <SourceSelector sources={sources} />}
        <SectionHeader text="Select File" />
        <SourceImporter />
        <RunButton />
      </SourceProvider>
    </>
  );
}
