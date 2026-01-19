import { getISODateString } from "@/const/date";
import { FiltersProps } from "./Filters";


export function pushFiltersToUrl(filters: FiltersProps) {
  const params = new URLSearchParams();
  filters.accounts?.forEach(acc => params.append("accounts", acc));
  filters.organisations?.forEach(org => params.append("organisations", org));
  filters.tagsIn?.forEach(tag => params.append("tagsIn", tag));
  filters.tagsOut?.forEach(tag => params.append("tagsOut", tag));
  if (filters.title) params.append("title", filters.title);
  if (filters.dateStart) params.append("dateStart", getISODateString(filters.dateStart));
  if (filters.dateEnd) params.append("dateEnd", getISODateString(filters.dateEnd));
  return params;
}

export function parseArrayParam(param: string | string[] | undefined): string[] {
  if (!param) return [];
  return Array.isArray(param) ? param : [param];
}

export function parseDateParam(param: string | undefined): Date | undefined {
  if (!param) return undefined;
  return new Date(param);
}

export function parseSearchParams(params: FiltersProps): FiltersProps {
  params.accounts = parseArrayParam(params.accounts);
  params.organisations = parseArrayParam(params.organisations);
  params.tagsIn = parseArrayParam(params.tagsIn);
  params.tagsOut = parseArrayParam(params.tagsOut);
  params.dateStart = parseDateParam(params.dateStart as string | undefined);
  params.dateEnd = parseDateParam(params.dateEnd as string | undefined);
  return params;
}