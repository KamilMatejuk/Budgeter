'use client';

import { Transaction, TransactionWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellTextWrap from "../cells/CellTextWrap";
import CellOrganisation from "../cells/CellOrganisation";
import CellValue from "../cells/CellValue";
import { Currency } from "@/types/enum";
import CellAccountName from "../cells/CellAccountName";


interface TableTransactionsProps {
  data: TransactionWithId[];
}

const columns: ColumnDef<TransactionWithId>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "account", header: "Account", cell: ({ row }) => <CellAccountName id={row.original.account} /> },
  { accessorKey: "title", header: "Title", cell: ({ row }) => <CellTextWrap value={row.original.title} /> },
  { accessorKey: "organisation", header: "Organisation", cell: ({ row }) => <CellOrganisation name={row.original.organisation} /> },
  { accessorKey: "value", header: "Value", cell: ({ row }) => <CellValue value={row.original.value} currency={Currency.PLN} colour />, },
  { accessorKey: "tags", header: "Tags" },
];

export default function TableTransactions({ data }: TableTransactionsProps) {
  return (
    <Table<Transaction, TransactionWithId>
      url="/api/transaction"
      tag="transaction"
      data={data}
      columns={columns}
      hideCreating />
  );
}
