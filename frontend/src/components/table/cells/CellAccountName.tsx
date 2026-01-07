import { ColumnDef } from "@tanstack/react-table";
import { useCash, usePersonalAccount } from "@/app/api/query";
import CellBank from "./CellBank";
import { getAccountName, getCashName } from "./AccountNameUtils";


interface CellAccountNameProps {
  id: string;
}

export default function CellAccountName({ id }: CellAccountNameProps) {
  const account = usePersonalAccount(id);
  const cash = useCash(id);

  return account ? (
    <div className="flex items-center gap-2">
      <CellBank bank={account.bank} />
      <p>{getAccountName(account, false)}</p>
    </div>
  ) : cash ? (
    <div className="flex items-center gap-2">
      <CellBank bank="Cash" />
      <p>{getCashName(cash)}</p>
    </div>
  ) : (
    <p>{id}</p>
  );
}

export function defineCellAccountName<T extends { account: string }>() {
  return {
    accessorKey: "account", header: "Account", cell: ({ row }) => <CellAccountName id={row.original.account} />,
  } as ColumnDef<T>;
}
