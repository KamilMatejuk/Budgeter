'use client';

import { TagComposition } from "@/types/backend";
import { useState } from "react";
import { getMonthName } from "@/const/date";
import { CellTag } from "../table/cells/CellTag";
import ChartWithOptions from "./ChartWithOptions";
import TagCompositionChart from "./TagCompositionChart";


interface TagCompositionChartsProps {
  data: TagComposition[];
}

export default function TagCompositionCharts({ data }: TagCompositionChartsProps) {
  const [tag, setTag] = useState<string>(data[0]?.tag._id);
  const composition = data.find((t) => t.tag._id === tag);
  const fullValues = composition?.values_total || []
  const yearValues = composition?.values_year || []
  const monthValues = composition?.values_month || []

  const thisMonthDate = new Date();
  const thisYearDate = new Date();
  thisYearDate.setMonth(thisYearDate.getMonth() - 11);
  return (
    <ChartWithOptions
      chart={<div className="grid grid-cols-3">
        <TagCompositionChart
          title="Full"
          subtitle="since beginning"
          data={fullValues.map(i => i.value)}
          labels={fullValues.map(i => i.tag_name)}
          colors={fullValues.map(i => i.colour)}
        />
        <TagCompositionChart
          title="This Year"
          subtitle={`since ${getMonthName(thisYearDate.getMonth() + 1)} ${thisYearDate.getFullYear()}`}
          data={yearValues.map(i => i.value)}
          labels={yearValues.map(i => i.tag_name)}
          colors={yearValues.map(i => i.colour)}
        />
        <TagCompositionChart
          title="This Month"
          subtitle={`since ${getMonthName(thisMonthDate.getMonth() + 1)} ${thisMonthDate.getFullYear()}`}
          data={monthValues.map(i => i.value)}
          labels={monthValues.map(i => i.tag_name)}
          colors={monthValues.map(i => i.colour)}
        />
      </div>}
      options={data.map((t) => ({
        id: t.tag._id,
        selected: t.tag._id === tag,
        body: <CellTag tag={t.tag} />
      }))}
      selectOption={setTag}
    />
  );
}
