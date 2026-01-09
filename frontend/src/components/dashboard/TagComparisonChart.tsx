'use client';

import { ChartRange, DEFAULT_CHART_RANGE } from "@/types/enum";
import ChartWithRanges from "./ChartWithRanges";
import { MonthComparisonRow } from "@/types/backend";
import { useState } from "react";
import { getMonthsFromValues, getMonthsInRange } from "@/const/date";
import Button from "../button/Button";
import CellTag from "../table/cells/CellTag";

function flatten(items: MonthComparisonRow[]): MonthComparisonRow[] {
  const result: MonthComparisonRow[] = [];
  function visit(list: MonthComparisonRow[]) {
    list.forEach((item) => {
      result.push({ ...item, subitems: [] });
      if (item.subitems?.length) visit(item.subitems);
    });
  }
  visit(items);
  return result;
}

interface TagComparisonChartProps {
  data: MonthComparisonRow[];
}

export default function TagComparisonChart({ data }: TagComparisonChartProps) {
  const flattened = flatten(data);
  const [range, setRange] = useState<keyof typeof ChartRange>(DEFAULT_CHART_RANGE);
  const [tag, setTag] = useState<string>(flattened[0]?._id || "");
  const tagValues = flattened.find((t) => t._id === tag)?.values.map(Math.abs) || [];
  // adjust values to range
  const tagValuesInRange = range === ChartRange["3M"]
    ? new Array(tagValues.length < 3 ? 3 - tagValues.length : 0).fill(0).concat(tagValues.slice(-3))
    : range === ChartRange["1Y"]
      ? new Array(tagValues.length < 12 ? 12 - tagValues.length : 0).fill(0).concat(tagValues.slice(-12))
      : tagValues;
  // get labels and values
  const months = getMonthsInRange(range); // can be empty for full range
  const labels = months.length ? months : getMonthsFromValues(tagValuesInRange); // fallback for full range
  const values = tagValuesInRange.length ? tagValuesInRange : Array(months.length).fill(0); // default to zeros if no data

  return (
    <div className="w-full grid grid-cols-[1fr_300px] gap-4">
      {/* chart */}
      <ChartWithRanges range={range} setRange={setRange} chart={{ type: 'line', props: { data: values, labels } }} />
      {/* options */}
      <div className="flex flex-col gap-1 overflow-y-auto overflow-x-hidden max-h-[300px]">
        {flattened.map((t) => (
          <Button
            key={t._id}
            text=""
            textInvisible
            action={t._id === tag ? "positive" : "neutral"}
            className="flex-1 flex justify-start px-2 py-1 "
            onClick={async () => setTag(t._id)}
          >
            <CellTag id={t.tag} />
          </Button>
        ))}
      </div>
    </div>
  );
}
