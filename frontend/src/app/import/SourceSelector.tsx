"use client";

import { Source } from "@/types/backend";
import SourceButton from "./SourceButton";

interface SourceSelectorProps {
  sources: Source[];
}

export default function SourceSelector({ sources }: SourceSelectorProps) {
  return (
    <form className="flex flex-wrap gap-2 justify-center overflow-x-auto py-2">
      {sources.map((source) => (
        <SourceButton source={source} key={source._id} />
      ))}
    </form>
  );
}
