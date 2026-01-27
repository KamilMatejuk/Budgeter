import { useQuery } from "@tanstack/react-query";
import { get } from "./fetch";
import { CashRichWithId, ChartRange, OrganisationRichWithId, PersonalAccountRichWithId, TagRichWithId, TransactionWithId } from "@/types/backend";
import { useEffect, useState } from "react";
import { formatValue } from "@/components/table/cells/CellValue";
import { getDateString } from "@/const/date";
import { _sortPersonalAccounts, getDebtTransactions } from "./getters";

function _useFetchWrapper<T>(queryKey: (string | number)[], revalidateKey: string[], url: string, run: any = true) {
  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      // until this variable is defined, don't run the query
      if (!run) return null;
      const { response } = await get<T>(url, revalidateKey);
      return response;
    },
  });
  return data;
}

export function useCashs() {
  return _useFetchWrapper<CashRichWithId[]>(
    ["cash"],
    ["cash"],
    '/api/products/cash',
  ) || [];
}

export function usePersonalAccounts() {
  const data = _useFetchWrapper<PersonalAccountRichWithId[]>(
    ["personal_account"],
    ["personal_account"],
    `/api/products/personal_account`
  ) || [];
  return _sortPersonalAccounts(data);
}

export function useRichTags() {
  return _useFetchWrapper<TagRichWithId[]>(
    ["tag", "rich"],
    ["tag"],
    `/api/tag/rich`
  ) || [];
}

export function useUsedTags() {
  return _useFetchWrapper<TagRichWithId[]>(
    ["tag", "used"],
    ["tag"],
    `/api/tag/used`
  ) || [];
}

export function useOrganisations() {
  return _useFetchWrapper<OrganisationRichWithId[]>(
    ["organisation"],
    ["organisation"],
    `/api/organisation`
  ) || [];
}

export function useLastTransaction(account: string) {
  return _useFetchWrapper<TransactionWithId>(
    ["transaction", "last", account],
    ["transaction"],
    `/api/transaction/last/${account}`,
    account,
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
    `/api/history/account_value/${range}/${accountId}`,
    accountId,
  ) || [];
}

export function useIncomeExpenseHistory(range: ChartRange) {
  return _useFetchWrapper<[number[], number[]]>(
    ["income_expense_history", range],
    ["transaction"],
    `/api/history/income_expense/${range}`,
  ) || [[], []];
}
