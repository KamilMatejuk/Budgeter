import { ColumnDef } from "@tanstack/react-table";
import { useCash, usePersonalAccount } from "@/app/api/query";
import CellBank from "./CellBank";
import { Cash, PersonalAccount } from "@/types/backend";
import { AccountType, CURRENCY_SYMBOLS } from "@/types/enum";


interface CellAccountNameProps {
  id: string;
}

export default function CellAccountName({ id }: CellAccountNameProps) {
  const account = usePersonalAccount(id);
  const cash = useCash(id);

  return account ? (
    <div className="flex items-center gap-2">
      <CellBank bank={account.bank} />
      <p>{getAccountName(account)}</p>
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

export function getAccountName(account: PersonalAccount, bank?: boolean) {
  return [
    bank ? (account.bank ? account.bank.slice(0, 1) : "") : null,
    `${account.owner}`,
    `${account.type.toLowerCase()}`,
    account.type == AccountType.EXCHANGE ? `${CURRENCY_SYMBOLS[account.currency]}` : null,
  ].join(" ");
}

export function getCashName(cash: Cash) {
  return `${cash.name} ${CURRENCY_SYMBOLS[cash.currency]}`;
}