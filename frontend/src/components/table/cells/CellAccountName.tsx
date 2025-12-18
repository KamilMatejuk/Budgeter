import { ColumnDef } from "@tanstack/react-table";
import { usePersonalAccount } from "@/app/api/query";


interface CellAccountNameProps {
  id: string;
}

export function defineCellAccountName<T extends { account: string }>() {
  return {
    accessorKey: "account", header: "Account", cell: ({ row }) => <CellAccountName id={row.original.account} />,
  } as ColumnDef<T>;
}

export default function CellAccountName({ id }: CellAccountNameProps) {
  const account = usePersonalAccount(id);
  return (<p>{account?.name || id}</p>);
}
