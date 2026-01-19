import { FiltersProps } from "./Filters";

export function pushFiltersToUrl(filters: FiltersProps) {
  const params = new URLSearchParams();
  filters.accounts?.forEach(acc => params.append("accounts", acc));
  filters.organisations?.forEach(org => params.append("organisations", org));
  filters.tagsIn?.forEach(tag => params.append("tagsIn", tag));
  filters.tagsOut?.forEach(tag => params.append("tagsOut", tag));
  if (filters.title) params.append("title", filters.title);
  return params;
}

export function parseArrayParam(param: string | string[] | undefined): string[] {
  if (!param) return [];
  return Array.isArray(param) ? param : [param];
}
