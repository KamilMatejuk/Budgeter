import { getISODateString } from "@/const/date";
import { FiltersProps } from "./Filters";
import { TagRichWithId } from "@/types/backend";


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

function parseArrayParam(param: string | string[] | undefined): string[] {
  if (!param) return [];
  return Array.isArray(param) ? param : [param];
}

function parseDateParam(param: string | undefined): Date | undefined {
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

export function getDateSearchSlug(month: number, year: number) {
  const dateStart = getISODateString(new Date(year, month - 1, 1));
  const dateEnd = getISODateString(new Date(year, month, 0));
  return `dateStart=${dateStart}&dateEnd=${dateEnd}`;
};

export function getTagsSearchSlug(tag: TagRichWithId, allTags: TagRichWithId[]) {
  if (!tag.name.endsWith("Other")) return `tagsIn=${tag._id}`;
  const parentTag = allTags.find(t => t.name === tag.name.replace("/Other", ""))!;
  const siblingTags = allTags.filter(t => t.name.startsWith(`${parentTag.name}/`) && t.name != tag.name);
  return siblingTags.map(t => `tagsOut=${t._id}`).concat(`tagsIn=${parentTag._id}`).join("&");
}
