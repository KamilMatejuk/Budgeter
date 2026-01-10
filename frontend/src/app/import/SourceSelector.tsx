"use client";

import ButtonWithLoader from "@/components/button/ButtonWithLoader";
import { useImportContext } from "./ImportContext";
import { Source } from "@/types/enum";

interface SourceSelectorProps {
  sources: string[];
  owners: string[];
}

export default function SourceSelector({ sources, owners }: SourceSelectorProps) {
  const { selectedSource, setSelectedSource, selectedOwner, setSelectedOwner } = useImportContext();

  return (
    <>
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
