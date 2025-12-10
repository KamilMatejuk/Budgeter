'use client';

import { TransactionWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellOrganisation from "../cells/CellOrganisation";
import CellValue from "../cells/CellValue";
import { Currency } from "@/types/enum";
import CellAccountName from "../cells/CellAccountName";
import { MdDelete, MdEdit } from "react-icons/md";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";
import UpdateTransactionModal from "@/components/modal/update/UpdateTransactionModal";


interface TableTransactionsProps {
  data: TransactionWithId[];
}

const columns: ColumnDef<TransactionWithId>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "account", header: "Account", cell: ({ row }) => <CellAccountName id={row.original.account} /> },
  { accessorKey: "title", header: "Title", meta: { wrap: true } },
  { accessorKey: "organisation", header: "Organisation", meta: { wrap: true }, cell: ({ row }) => <CellOrganisation name={row.original.organisation} /> },
  { accessorKey: "value", header: "Value", cell: ({ row }) => <CellValue value={row.original.value} currency={Currency.PLN} colour />, meta: { alignedRight: true } },
  { accessorKey: "tags", header: "Tags" },
];

export default function TableTransactions({ data }: TableTransactionsProps) {
  return (
    <Table<TransactionWithId>
      url="/api/transaction"
      tag="transaction"
      data={data}
      columns={columns}
      options={[
        { name: "Edit", icon: MdEdit, component: UpdateTransactionModal },
        { name: "Delete", icon: MdDelete, component: DeleteByIdModal },
      ]} />
  );
}
