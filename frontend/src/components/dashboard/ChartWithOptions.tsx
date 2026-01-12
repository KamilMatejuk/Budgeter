'use client';

import { ReactNode } from "react";
import Button from "../button/Button";

interface ChartWithOptionsProps {
  chart: ReactNode;
  options: { id: string, selected: boolean, name?: string, body?: ReactNode }[];
  selectOption: (id: string) => void;
}

export default function ChartWithOptions({ chart, options, selectOption }: ChartWithOptionsProps) {
  return (
    <div className="w-full grid grid-cols-[1fr_300px] gap-4">
      {/* chart */}
      {chart}
      {/* options */}
      <div className="flex flex-col gap-1 overflow-y-auto overflow-x-hidden max-h-[300px]">
        {options.map((a) => (
          <Button
            key={a.id}
            text={a.name || ""}
            textInvisible={!a.name}
            action={a.selected ? "positive" : "neutral"}
            className="flex-1 flex justify-start px-2 py-1"
            onClick={async () => selectOption(a.id)}
          >
            {a.body}
          </Button>
        ))}
      </div>
    </div>
  );
}
