'use client';

import { useState } from "react";
import { Comparison } from "@/types/backend";
import { FiltersProps } from "./Filters";
import Detail, { DetailProps } from "./Detail";
import MonthSelector, { Range } from "./MonthSelector";
import MultiColumnSection from "@/components/page_layout/MultiColumnSection";

interface DetailsProps {
  filters: FiltersProps;
  data: Comparison[];
  slug: string;
}

function combineComparisons(data: Comparison[], range: Range): Omit<DetailProps, "range" | "slug"> {
  const found = data.filter(d => {
    const dateIdx = d.year * 12 + d.month;
    const startIdx = range.startYear * 12 + range.startMonth;
    const endIdx = range.endYear * 12 + range.endMonth;
    return dateIdx >= startIdx && dateIdx <= endIdx;
  });
  return {
    transactions: found.reduce((sum, curr) => sum + curr.transactions, 0),
    value: found.reduce((sum, curr) => sum + curr.value, 0),
  }
}

export default function Details({ data, filters, slug }: DetailsProps) {
  const [selectedRanges, setSelectedRanges] = useState<Range[]>(
    filters.dates?.length ? filters.dates.map(d => ({
      startMonth: d.start.getMonth(), startYear: d.start.getFullYear(),
      endMonth: d.end.getMonth(), endYear: d.end.getFullYear(),
    })) : [{
      startMonth: data[data.length - 1].month, startYear: data[data.length - 1].year,
      endMonth: data[data.length - 1].month, endYear: data[data.length - 1].year,
    }]
  );

  return (
    <>
      <MonthSelector data={data} selectedRanges={selectedRanges} setSelectedRanges={setSelectedRanges} />
      <div className="w-full flex flex-nowrap gap-2 justify-center">
        <MultiColumnSection>
          {selectedRanges.map((r, i) => (
            <Detail key={i} {...combineComparisons(data, r)} range={r} slug={slug} />
          ))}
        </MultiColumnSection>
      </div>
    </>
  );
}
