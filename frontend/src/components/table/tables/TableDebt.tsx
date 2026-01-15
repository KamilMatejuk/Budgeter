'use client';

import { TransactionRichWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { defineCellOrganisation } from "../cells/CellOrganisation";
import { defineCellValue } from "../cells/CellValue";
import { BsFillPiggyBankFill } from "react-icons/bs";
import DebtRepayTransactionModal from "@/components/modal/custom/DebtRepayTransactionModal";
import { getDateString } from "@/const/date";


interface TableDebtProps {
  data: TransactionRichWithId[];
}

const columns: ColumnDef<TransactionRichWithId>[] = [
  { accessorKey: "debt_person", header: "Person" },
  { accessorKey: "date", header: "Date", cell: ({ row }) => getDateString(new Date(row.original.date)) },
  { accessorKey: "title", header: "Title", meta: { wrapForce: true } },
  defineCellOrganisation<TransactionRichWithId>(),
  defineCellValue<TransactionRichWithId>(true),
];

export default function TableDebt({ data }: TableDebtProps) {
  return (
    <Table<TransactionRichWithId>
      url="/api/transaction"
      tag="transaction"
      data={data}
      columns={columns}
      options={[
        { name: "Debt/Repay", icon: BsFillPiggyBankFill, component: DebtRepayTransactionModal },
      ]} />
  );
}
