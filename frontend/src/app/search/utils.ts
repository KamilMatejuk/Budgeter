import { getISODateString } from "@/const/date";
import { FiltersProps, TagsFiltersProps } from "./Filters";
import { TagRichWithId } from "@/types/backend";
import { DEFAULT_JOIN, Join } from "@/types/enum";


export function pushTagFiltersToUrl(filters: TagsFiltersProps) {
  const params = new URLSearchParams();
  filters.tagsIn?.forEach(tag => params.append("tagsIn", tag));
  filters.tagsOut?.forEach(tag => params.append("tagsOut", tag));
  if (filters.tagsInJoin && filters.tagsInJoin !== DEFAULT_JOIN) params.append("tagsInJoin", filters.tagsInJoin);
  if (filters.tagsOutJoin && filters.tagsOutJoin !== DEFAULT_JOIN) params.append("tagsOutJoin", filters.tagsOutJoin);
  return params;
}

export function pushFiltersToUrl(filters: FiltersProps) {
  const params = pushTagFiltersToUrl(filters);
  filters.accounts?.forEach(acc => params.append("accounts", acc));
  filters.organisations?.forEach(org => params.append("organisations", org));
  if (filters.title) params.append("title", filters.title);
  if (filters.dateStart) params.append("dateStart", getISODateString(filters.dateStart));
  if (filters.dateEnd) params.append("dateEnd", getISODateString(filters.dateEnd));
  return params;
}

function parseArrayParam(param: string | string[] | undefined): string[] {
  if (!param) return [];
  if (!Array.isArray(param)) return [param];
  return Array.from(new Set(param));
}

function parseDateParam(param: string | undefined): Date | undefined {
  if (!param) return undefined;
  return new Date(param);
}

function parseJoinParam(param: string | undefined): Join {
  if (!param) return DEFAULT_JOIN;
  return Join[param as keyof typeof Join] || DEFAULT_JOIN;
}

export function parseTagsSearchParams(params: FiltersProps): FiltersProps {
  params.tagsIn = parseArrayParam(params.tagsIn);
  params.tagsOut = parseArrayParam(params.tagsOut);
  params.tagsInJoin = parseJoinParam(params.tagsInJoin);
  params.tagsOutJoin = parseJoinParam(params.tagsOutJoin);
  return params;
}

export function parseSearchParams(params: FiltersProps): FiltersProps {
  params = parseTagsSearchParams(params);
  params.accounts = parseArrayParam(params.accounts);
  params.organisations = parseArrayParam(params.organisations);
  params.dateStart = parseDateParam(params.dateStart as string | undefined);
  params.dateEnd = parseDateParam(params.dateEnd as string | undefined);
  return params;
}

export function getDescriptiveTagSearchParams(params: FiltersProps) {
  const parts: string[] = [];
  if (params.tagsIn && params.tagsIn.length > 0) parts.push(`${params.tagsIn.length} included tag(s)`);
  if (params.tagsOut && params.tagsOut.length > 0) parts.push(`${params.tagsOut.length} excluded tag(s)`);
  return parts.join(", ");
}

export function getDescriptiveSearchParams(params: FiltersProps) {
  const tagDesc = getDescriptiveTagSearchParams(params);
  const parts: string[] = tagDesc ? [tagDesc] : [];
  if (params.accounts && params.accounts.length > 0) parts.push(`${params.accounts.length} account(s)`);
  if (params.organisations && params.organisations.length > 0) parts.push(`${params.organisations.length} organisation(s)`);
  if (params.title) parts.push(`title contains "${params.title}"`);
  if (params.dateStart) parts.push(`from ${getISODateString(params.dateStart)}`);
  if (params.dateEnd) parts.push(`to ${getISODateString(params.dateEnd)}`);
  return parts.join(", ");
}

export function getDateSearchSlug(month: number, year: number) {
  const dateStart = getISODateString(new Date(year, month - 1, 1));
  const dateEnd = getISODateString(new Date(year, month, 0));
  return `dateStart=${dateStart}&dateEnd=${dateEnd}`;
};

export function getTagsSearchSlug(tag: TagRichWithId, allTags: TagRichWithId[]) {
  if (allTags.length === 0) return `tagsIn=${tag._id}`;
  if (!tag.name.endsWith("Other")) return `tagsIn=${tag._id}`;
  const parentTag = allTags.find(t => t.name === tag.name.replace("/Other", ""))!;
  const siblingTags = allTags.filter(t => t.name.startsWith(`${parentTag.name}/`) && t.name != tag.name);
  return siblingTags.map(t => `tagsOut=${t._id}`).concat(`tagsIn=${parentTag._id}`).join("&");
}
