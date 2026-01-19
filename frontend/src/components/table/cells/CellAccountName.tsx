import { ColumnDef } from "@tanstack/react-table";
import CellBank from "./CellBank";
import { getAccountName, getCashName } from "./AccountNameUtils";
import { CashWithId, PersonalAccountWithId } from "@/types/backend";
import { usePersonalAccount } from "@/app/api/query";


interface CellAccountNameProps {
  account: PersonalAccountWithId | CashWithId;
  cash?: boolean;
}

export default function CellAccountName({ account, cash }: CellAccountNameProps) {
  return cash ? (
    <div className="flex items-center gap-2">
      <CellBank bank="Cash" />
      <p>{getCashName(account as CashWithId)}</p>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <CellBank bank={(account as PersonalAccountWithId).bank} />
      <p>{getAccountName(account as PersonalAccountWithId, false)}</p>
    </div>
  );
}

export function CellAccountId({ id }: { id: string }) {
  const account = usePersonalAccount(id);
  return account ? <CellAccountName account={account} /> : id;
}


export function defineCellAccountName<T extends CellAccountNameProps>() {
  return {
    accessorKey: "account",
    header: "Account",
    cell: ({ row }) => <CellAccountName account={row.original.account} cash={row.original.cash} />,
  } as ColumnDef<T>;
}
