"use client";

import ButtonWithLoader from "@/components/button/ButtonWithLoader";
import { useSelectedSourceAndFile } from "./ImportContext";

interface SourceSelectorProps {
  sources: string[];
}

export default function SourceSelector({ sources }: SourceSelectorProps) {
  const { selectedSource, setSelectedSource } = useSelectedSourceAndFile();

  return (
    <form className="flex flex-wrap gap-2 justify-center overflow-x-auto py-2">
      {sources.map((source, i) => (
        <ButtonWithLoader
          key={i}
          text={source}
          onClick={async () => await setSelectedSource(source)}
          action={source === selectedSource ? "positive" : "neutral"}
        />
      ))}
    </form>
  );
}
