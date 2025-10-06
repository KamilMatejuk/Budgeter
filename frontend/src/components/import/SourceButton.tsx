"use client";

import { Source } from "@/types/backend";
import { useSelectedSourceAndFile } from "./ImportContext";
import { twMerge } from "tailwind-merge";

interface SourceButtonProps {
  source: Source;
}

export default function SourceButton({ source }: SourceButtonProps) {
  const { selectedSource, setSelectedSource } = useSelectedSourceAndFile();
  const isSelected = selectedSource?._id === source._id;

  return (
    <button
      type="button"
      className={twMerge(
        "bg-second-bg px-4 py-2 rounded-xl flex items-center gap-4 whitespace-nowrap cursor-pointer hover:bg-green-200 transition ",
        isSelected ? "bg-green-100 text-green-800 border border-green-300" : "border border-transparent"
      )}
      onClick={() => setSelectedSource(source)}
    >
      {source.name}
    </button>
  );
}
