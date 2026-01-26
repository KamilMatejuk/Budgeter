import { parseTagsSearchParams, pushTagFiltersToUrl } from "../search/utils";
import { FiltersProps } from "./Filters";


export function pushFiltersToUrl(filters: Omit<FiltersProps, "dates">) {
  const params = pushTagFiltersToUrl(filters);
  return params;
}

export function pushSelectorsToUrl(selectors: Omit<FiltersProps, "tagIn" | "tagOut">) {
  const params = new URLSearchParams(window.location.search);
  params.delete("dates");
  selectors.dates?.forEach(({ start, end }) => {
    params.append("dates", `${start.getMonth() + 1}.${start.getFullYear()}_${end.getMonth() + 1}.${end.getFullYear()}`);
  });
  return params;
}

export function parseSearchParams(params: FiltersProps): FiltersProps {
  params = parseTagsSearchParams(params);
  params.dates = params.dates ? Array.isArray(params.dates) ? params.dates : [params.dates] : [];
  params.dates = params.dates.map(dateRange => {
    if (typeof dateRange === "string") {
      const [start, end] = String(dateRange).split("_");
      const [startMonth, startYear] = start.split(".");
      const [endMonth, endYear] = end.split(".");
      return { start: new Date(Number(startYear), Number(startMonth), 1), end: new Date(Number(endYear), Number(endMonth) + 1, 0) };
    }
    return dateRange;
  });
  return params;
}
