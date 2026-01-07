import { useQuery } from "@tanstack/react-query";
import { get } from "./fetch";
import { CashWithId, ChartRange, OrganisationWithId, PersonalAccountWithId, TagWithId } from "@/types/backend";
import { useEffect, useState } from "react";
import { formatValue } from "@/components/table/cells/CellValue";
import { getDateString } from "@/const/date";
import { getDebtTransactions } from "./getters";

function _useFetchWrapper<T>(queryKey: string[], revalidateKey: string[], url: string) {
  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      const { response } = await get<T>(url, revalidateKey);
      return response;
    },
  });
  return data;
}

export function useCashs() {
  return _useFetchWrapper<CashWithId[]>(
    ["cash"],
    ["cash"],
    '/api/products/cash',
  ) || [];
}

export function useCash(id: string) {
  return _useFetchWrapper<CashWithId>(
    ["cash"],
    ["cash"],
    `/api/products/cash/${id}`,
  ) || undefined;
}

export function usePersonalAccounts() {
  return _useFetchWrapper<PersonalAccountWithId[]>(
    ["personal_account"],
    ["personal_account"],
    `/api/products/personal_account`
  ) || [];
}

export function usePersonalAccount(id: string) {
  return _useFetchWrapper<PersonalAccountWithId>(
    ["personal_account", id],
    ["personal_account"],
    `/api/products/personal_account/${id}`
  ) || undefined;
}

export function useTags() {
  return _useFetchWrapper<TagWithId[]>(
    ["tag"],
    ["tag"],
    `/api/tag`
  ) || [];
}

export function useOrganisation(name: string) {
  return _useFetchWrapper<OrganisationWithId>(
    ["organisation", name],
    ["organisation"],
    `/api/organisation/regex/${name}`
  ) || undefined;
}

export function usePeopleWithDebt() {
  // don't use useQuery, because we cannot track revalidation here
  const [people, setPeople] = useState<Record<string, string>>({});
  useEffect(() => {
    (async () => {
      const { response } = await getDebtTransactions();
      const people = (response || []).reduce(
        (acc, curr) => {
          const description = `${formatValue(Math.abs(curr.value), curr.currency)} on ${getDateString(curr.date)}`;
          return { ...acc, [curr._id]: `${curr.debt_person} (${description})` }
        },
        {} as Record<string, string>
      );
      setPeople(people);
    })();
  }, []);
  return people;
}

export function useTotalAccountValueHistory(range: ChartRange = '3M') {
  return _useFetchWrapper<number[]>(
    ["account_value_history", range],
    ["personal_account", "transaction"],
    `/api/history/account_value/${range}`
  ) || [];
}

export function useAccountValueHistory(range: ChartRange = '3M', accountId: string) {
  return _useFetchWrapper<number[]>(
    ["account_value_history", range, accountId],
    ["personal_account", "transaction"],
    `/api/history/account_value/${range}/${accountId}`
  ) || [];
}

export function useIncomeExpenseHistory(range: ChartRange) {
  return _useFetchWrapper<[number[], number[]]>(
    ["income_expense_history", range],
    ["transaction"],
    `/api/history/income_expense/${range}`
  ) || [[], []];
}
