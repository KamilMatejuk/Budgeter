import ErrorToast from "../toast/ErrorToast";
import TableMonthComparison from "../table/tables/TableMonthComparison";
import { getCompareData, getTags } from "@/app/api/getters";
import { ComparisonItemRecursive } from "@/types/backend";

export type AggComparisonItemRecursive = Omit<ComparisonItemRecursive, "value_pln"> & {
  values_pln: number[];
  value_avg_pln: number;
  children: AggComparisonItemRecursive[];
};

function combineMonths(items: ComparisonItemRecursive[]): AggComparisonItemRecursive {
  return {
    _id: items[0]._id,
    tag: items[0].tag,
    values_pln: items.map(i => i.value_pln),
    value_avg_pln: items.reduce((acc, i) => acc + i.value_pln, 0) / items.length,
    children: items[0].children.map((_, idx) =>
      combineMonths(items.map(i => i.children[idx]))
    )
  } as AggComparisonItemRecursive;
}

export default async function MonthComparison() {
  const { response: tags, error } = await getTags();
  if (error != null)
    return <ErrorToast message={`Could not download month comparison: ${error}`} />;

  const data: AggComparisonItemRecursive[] = [];
  const rootTags = tags.filter(t => t.parent == null);
  for (const tag of rootTags) {
    const { response, error } = await getCompareData({ tagsIn: [tag._id] });
    if (error != null)
      return <ErrorToast message={`Could not download month comparison for tag ${tag.name}: ${error}`} />;
    // response is a list of months, with one tag per each month (the root tag)
    data.push(combineMonths(response.map(r => r.children_tags[0])));
  }

  return (
    <TableMonthComparison data={data} />
  );
}
