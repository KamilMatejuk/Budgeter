import { useQuery } from "@tanstack/react-query";
import { get } from "./fetch";
import { OrganisationWithId, PersonalAccountWithId, TagWithId, TransactionWithId } from "@/types/backend";
import { useEffect, useState } from "react";
import { formatValue } from "@/components/table/cells/CellValue";
import { getDateString } from "@/const/date";


export function usePersonalAccounts() {
  const { data } = useQuery({
    queryKey: ["personal_account"],
    queryFn: async () => {
      const { response } = await get<PersonalAccountWithId[]>(`/api/products/personal_account`, ["personal_account"]);
      return response;
    },
  })
  return data;
}

export function usePersonalAccount(id: string) {
  const { data } = useQuery({
    queryKey: ["personal_account", id],
    queryFn: async () => {
      const { response } = await get<PersonalAccountWithId>(`/api/products/personal_account/${id}`, ["personal_account"]);
      return response;
    },
  });
  return data;
}

export function useTags() {
  const { data } = useQuery({
    queryKey: ["tag"],
    queryFn: async () => {
      const { response } = await get<TagWithId[]>("/api/tag", ["tag"]);
      return response;
    },
  })
  return data;
}

export function useOrganisation(name: string) {
  const { data } = useQuery({
    queryKey: ["organisation", name],
    queryFn: async () => {
      const { response } = await get<OrganisationWithId>(`/api/organisation/regex/${name}`, ["organisation"]);
      return response;
    },
  })
  return data;
}

export function usePeopleWithDebt() {
  // don't use useQuery, because we cannot track revalidation here
  const [people, setPeople] = useState<Record<string, string>>({});
  useEffect(() => {
    (async () => {
      const { response } = await get<TransactionWithId[]>(`/api/transactions/debt`, ["transaction", "debt"]);
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
