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
import { getPersonalAccounts, getSources } from "../api/getters";
import { Source } from "@/types/enum";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Import" };

export default async function Import() {
  const { response: sources, error: sourcesError } = await getSources();
  const { response: accounts, error: accountsError } = await getPersonalAccounts();

  const supportedSources = (sources || []).filter(source => source != Source.EDENRED) as Source[];
  const owners = new Array(...new Set((accounts || [])
    .filter(account => account.bank == Source.REVOLUT)
    .map(account => account.owner)));

  return (
    <>
      <PageHeader text="Import" subtext="Add new transactions" />
      <MultiColumnSection>
        <>
          <SourceProvider>
            <SectionHeader text="From file" subtext="Load report from your preferred source" />
            {sourcesError != null || accountsError != null
              ? <ErrorToast message={`Could not download sources: ${sourcesError ?? accountsError}`} />
              : sources.length == 0
                ? <WarningToast message="No sources available. Please add a source." />
                : <SourceSelector sources={supportedSources} owners={owners} />}
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
