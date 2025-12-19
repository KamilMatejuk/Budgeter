import { ColumnDef } from "@tanstack/react-table";
import { usePersonalAccount } from "@/app/api/query";
import CellIcon from "./CellIcon";


interface CellAccountNameProps {
  id: string;
}

export default function CellAccountName({ id }: CellAccountNameProps) {
  const account = usePersonalAccount(id);
  return (
    <div className="flex items-center gap-2">
      {account?.icon && <CellIcon source={account.icon} alt={account.name} />}
      <p>{account?.name || id}</p>
    </div>
  );
}

export function defineCellAccountName<T extends { account: string }>() {
  return {
    accessorKey: "account", header: "Account", cell: ({ row }) => <CellAccountName id={row.original.account} />,
  } as ColumnDef<T>;
}
