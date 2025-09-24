"use client";

import { Source } from "@/types/backend";
import { useRouter } from "next/navigation";
import SourceButton from "./SourceButton";
import ButtonWithLoader from "../button/ButtonWithLoader";

interface SourceSelectorProps {
  sources: Source[];
}

export default function SourceSelector({ sources }: SourceSelectorProps) {
  const router = useRouter();

  return (
    <div className="bg-second-bg p-4 rounded-xl flex flex-col items-center gap-4">
      <h2 className="text-lg font-semibold">Select Source</h2>
      <div className="bg-first-bg w-full px-4 py-2 rounded-xl">
        <form className="flex flex-wrap gap-2 justify-center overflow-x-auto py-2">
          {sources.map((source) => (
            <SourceButton source={source} key={source._id} />
          ))}
          <ButtonWithLoader
            onClick={async () => {
              router.push("/source/new");
            }}
            text="+"
          />
        </form>
      </div>
    </div>
  );
}
