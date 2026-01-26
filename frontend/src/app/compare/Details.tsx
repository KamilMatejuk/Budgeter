'use client';

import { useState } from "react";
import { Comparison } from "@/types/backend";
import { FiltersProps } from "./Filters";
import Detail, { DetailProps } from "./Detail";
import MonthSelector, { Range } from "./MonthSelector";
import MultiColumnSection from "@/components/page_layout/MultiColumnSection";
import { DoubleBarChart } from "@/components/dashboard/Chart";
import { getMonthName } from "@/const/date";
import SectionHeader from "@/components/page_layout/SectionHeader";
import Summary from "@/components/page_layout/Summary";
import { pushTagFiltersToUrl } from "../search/utils";

interface DetailsProps {
  filters: FiltersProps;
  data: Comparison[];
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

export default function Details({ data, filters }: DetailsProps) {
  const [selectedRanges, setSelectedRanges] = useState<Range[]>(
    filters.dates?.length ? filters.dates.map(d => ({
      startMonth: d.start.getMonth(), startYear: d.start.getFullYear(),
      endMonth: d.end.getMonth(), endYear: d.end.getFullYear(),
    })) : [{
      startMonth: data[data.length - 1].month, startYear: data[data.length - 1].year,
      endMonth: data[data.length - 1].month, endYear: data[data.length - 1].year,
    }]
  );

  const min_value = Math.min(...data.map(d => d.value));
  const max_value = Math.max(...data.map(d => d.value));
  const avg_value = data.reduce((sum, d) => sum + d.value, 0) / data.length;
  const slug = pushTagFiltersToUrl(filters).toString();

  return (
    <>
      {/* summary */}
      <SectionHeader text="Summary" />
      <Summary data={[
        { value: min_value.toFixed(2) + ' zł', label: 'Minimal monthly value' },
        { value: max_value.toFixed(2) + ' zł', label: 'Maximal monthly value' },
        { value: avg_value.toFixed(2) + ' zł', label: 'Average monthly value' },
      ]} />
      {/* history */}
      <SectionHeader text="History" subtext="Select visible ranges on the graph, drag to select multiple, click selected ranges to remove them." />
      <div className="relative pb-2">
        <DoubleBarChart
          dataPositive={data.map(d => d.value > 0 ? d.value : 0)}
          dataNegative={data.map(d => d.value < 0 ? d.value : 0)}
          labels={data.map(d => getMonthName(d.month) + ' ' + d.year)} />
        <div className="absolute top-0 bottom-0 left-12 right-0 w-[calc(100%-48px)] h-[304px]">
          <MonthSelector data={data} selectedRanges={selectedRanges} setSelectedRanges={setSelectedRanges} />
        </div>
      </div>
      {/* details */}
      <SectionHeader text="Results" />
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
