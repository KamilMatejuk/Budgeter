import { useQuery } from "@tanstack/react-query";
import { get } from "@/app/api/fetch";
import { PersonalAccountWithId } from "@/types/backend";
import { ColumnDef } from "@tanstack/react-table";


interface CellAccountNameProps {
  id: string;
}

export function defineCellAccountName<T extends { account: string }>() {
  return {
    accessorKey: "account", header: "Account", cell: ({ row }) => <CellAccountName id={row.original.account} />,
  } as ColumnDef<T>;
}

export default function CellAccountName({ id }: CellAccountNameProps) {
  const { data: account } = useQuery({
    queryKey: ["personal_account", id],
    queryFn: async () => {
      const { response } = await get<PersonalAccountWithId>(`/api/products/personal_account/${id}`, ["personal_account"]);
      return response;
    },
  });

  return (<p>{account?.name || id}</p>);
}
