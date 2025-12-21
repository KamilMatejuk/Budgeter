'use client';

import { TransactionWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellOrganisation from "../cells/CellOrganisation";
import { defineCellValue } from "../cells/CellValue";
import { BsFillPiggyBankFill } from "react-icons/bs";
import DebtRepayTransactionModal from "@/components/modal/custom/DebtRepayTransactionModal";
import { getDateString } from "@/const/date";


interface TableDebtProps {
  data: TransactionWithId[];
}

const columns: ColumnDef<TransactionWithId>[] = [
  { accessorKey: "debt_person", header: "Person" },
  { accessorKey: "date", header: "Date", cell: ({ row }) => getDateString(new Date(row.original.date)) },
  { accessorKey: "title", header: "Title", meta: { wrapForce: true } },
  { accessorKey: "organisation", header: "Organisation", meta: { wrap: true }, cell: ({ row }) => <CellOrganisation name={row.original.organisation} /> },
  defineCellValue<TransactionWithId>(true),
];

export default function TableDebt({ data }: TableDebtProps) {
  return (
    <Table<TransactionWithId>
      url="/api/transaction"
      tag="transaction"
      data={data}
      columns={columns}
      options={[
        { name: "Debt/Repay", icon: BsFillPiggyBankFill, component: DebtRepayTransactionModal },
      ]} />
  );
}
