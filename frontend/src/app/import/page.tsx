import { get } from "../api/fetch";
import ErrorToast from "@/components/toast/ErrorToast";
import { SourceProvider } from "@/app/import/ImportContext";
import SourceSelector from "@/app/import/SourceSelector";
import FileSelector from "@/app/import/FileSelector";
import RunButton from "@/app/import/RunButton";
import PageHeader from "@/components/page_layout/PageHeader";
import SectionHeader from "@/components/page_layout/SectionHeader";
import WarningToast from "@/components/toast/WarningToast";
import ManualCreation from "./ManualCreation";

const classes = {
  container: "grid grid-cols-[1fr_1px_1fr] gap-4",
  column: "p-2 pb-16",
  divider: "bg-second-bg",
}

export default async function Import() {
  const { response: sources, error } = await get<string[]>("/api/source");

  return (
    <>
      <PageHeader text="Import" subtext="Add new transactions" />
      <div className={classes.container}>
        <div className={classes.column}>
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
        </div>
        <div className={classes.divider} />
        <div className={classes.column}>
          <SectionHeader text="Manually" subtext="If your source is not yet supported, you can manually fill the fields" />
          <ManualCreation />
        </div>
      </div>
    </>
  );
}
