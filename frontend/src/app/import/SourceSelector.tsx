"use client";

import ButtonWithLoader from "@/components/button/ButtonWithLoader";
import { useImportContext } from "./ImportContext";
import { Source } from "@/types/enum";
import InfoToast from "@/components/toast/InfoToast";

interface SourceSelectorProps {
  sources: Source[];
  owners: string[];
}

const downloadInstructions: Record<Source, string> = {
  [Source.REVOLUT]: "In app home screen, go to 'Accounts', select any account, tap on 'Statement', choose all accounts and select excel format. Make a copy to google drive.",
  [Source.MILLENNIUM]: "On the website, go to 'Moje Finanse', select 'Wyciąg z historii transakcji'. Confirm in app. Correct the type from PDF to CSV and re-download the file.",
  [Source.EDENRED]: "",
}

export default function SourceSelector({ sources, owners }: SourceSelectorProps) {
  const { selectedSource, setSelectedSource, selectedOwner, setSelectedOwner } = useImportContext();

  return (
    <>
      {selectedSource && (<InfoToast message={`To download report:\n${downloadInstructions[selectedSource]}`} />)}
      <div className="flex flex-wrap gap-2 justify-center overflow-x-auto py-2">
        {sources.map((source, i) => (
          <ButtonWithLoader
            key={i}
            text={source}
            onClick={async () => { await setSelectedSource(source); await setSelectedOwner(""); }}
            action={source === selectedSource ? "positive" : "neutral"}
            disabled={source === Source.REVOLUT && owners.length === 0}
          />
        ))}
      </div>
      {selectedSource === Source.REVOLUT && (
        <>
          <p className="text-subtext text-sm text-center">Select owner for the Revolut account</p>
          <div className="flex flex-wrap gap-2 justify-center overflow-x-auto py-2">
            {owners.map((owner, i) => (
              <ButtonWithLoader
                key={i}
                text={owner}
                onClick={async () => await setSelectedOwner(owner)}
                action={owner === selectedOwner ? "positive" : "neutral"}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
