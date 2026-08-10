import ErrorToast from "../toast/ErrorToast";
import TableMonthComparison from "../table/tables/TableMonthComparison";
import { getCompareData, getTags } from "@/app/api/getters";
import { ComparisonItemRecursive } from "@/types/backend";
import { median, average, coefficientOfVariation } from 'simple-statistics'


export type AggComparisonItemRecursive = Omit<ComparisonItemRecursive, "value_pln" | "children"> & {
  values_pln: number[];
  value_median_pln: number;
  value_avg_pln: number;
  value_cv_pln: number;
  children: AggComparisonItemRecursive[];
};

function combineMonths(items: ComparisonItemRecursive[]): AggComparisonItemRecursive {
  const values_pln = items.map(i => i.value_pln);
  return {
    _id: items[0]._id,
    tag: items[0].tag,
    values_pln,
    value_median_pln: median(values_pln),
    value_avg_pln: average(values_pln),
    value_cv_pln: coefficientOfVariation(values_pln.map((v) => Math.abs(v))),
    children: items[0].children.map((_, idx) =>
      combineMonths(items.map(i => i.children[idx]))
    )
  } as AggComparisonItemRecursive;
}

function paddValues(items: AggComparisonItemRecursive[], max: number): AggComparisonItemRecursive[] {
  return items.map((i) => {
    i.values_pln.unshift(...Array(max - i.values_pln.length).fill(0));
    if (i.children) i.children = paddValues(i.children, max)
    return i
  })
}

export default async function MonthComparison() {
  const { response: tags, error } = await getTags();
  if (error != null)
    return <ErrorToast message={`Could not download month comparison: ${error}`} />;

  const data: AggComparisonItemRecursive[] = [];
  const rootTags = tags.filter(t => t.parent == null);
  for (const tag of rootTags) {
    const { response, error } = await getCompareData({ tagsIn: [tag._id], hideOutliers: true });
    if (error != null)
      return <ErrorToast message={`Could not download month comparison for tag ${tag.name}: ${error}`} />;
    // response is a list of months, with one tag per each month (the root tag)
    if (response.length === 0) continue;
    data.push(combineMonths(response.map(r => r.children_tags[0])));
  }
  // padd with 0 if tags started in different months
  const maxMonths = Math.max(...data.map(d => d.values_pln.length));
  return (
    <TableMonthComparison data={paddValues(data, maxMonths)} />
  );
}
