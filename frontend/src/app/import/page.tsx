import ErrorToast from "@/components/toast/ErrorToast";
import { SourceProvider } from "@/app/import/ImportContext";
import SourceSelector from "@/app/import/SourceSelector";
import FileSelector from "@/app/import/FileSelector";
import RunButton from "@/app/import/RunButton";
import PageHeader from "@/components/page_layout/PageHeader";
import SectionHeader from "@/components/page_layout/SectionHeader";
import WarningToast from "@/components/toast/WarningToast";
import ManualCreation from "./ManualCreation";
import MultiColumnSection from "@/components/page_layout/MultiColumnSection";
import { getSources } from "../api/getters";


export default async function Import() {
  const { response: sources, error } = await getSources();

  return (
    <>
      <PageHeader text="Import" subtext="Add new transactions" />
      <MultiColumnSection>
        <>
          <SourceProvider>
            <SectionHeader text="From file" subtext="Load report from your preferred source" />
            {error
              ? <ErrorToast message="Could not download sources" />
              : sources.length == 0
                ? <WarningToast message="No sources available. Please add a source." />
                : <SourceSelector sources={sources} />}
            <FileSelector />
            <RunButton />
          </SourceProvider>
        </>
        <>
          <SectionHeader text="Manually" subtext="If your source is not yet supported, you can manually fill the fields" />
          <ManualCreation />
        </>
      </MultiColumnSection>
    </>
  );
}
