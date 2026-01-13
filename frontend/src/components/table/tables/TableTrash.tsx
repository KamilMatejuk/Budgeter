'use client';

import { TransactionWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellOrganisation from "../cells/CellOrganisation";
import { defineCellValue } from "../cells/CellValue";
import { defineCellAccountName } from "../cells/CellAccountName";
import { MdRestore } from "react-icons/md";
import { defineCellTag } from "../cells/CellTag";
import { getDateString } from "@/const/date";
import GroupRestoreByIdModal from "@/components/modal/delete/GroupRestoreByIdModal";
import RestoreByIdModal from "@/components/modal/delete/RestoreByIdModal";


interface TableTrashProps {
  data: TransactionWithId[];
}

const columns: ColumnDef<TransactionWithId>[] = [
  { accessorKey: "date", header: "Date", cell: ({ row }) => getDateString(new Date(row.original.date)) },
  defineCellAccountName<TransactionWithId>(),
  { accessorKey: "title", header: "Title", meta: { wrapForce: true } },
  { accessorKey: "organisation", header: "Organisation", meta: { wrap: true }, cell: ({ row }) => <CellOrganisation name={row.original.organisation} /> },
  defineCellValue<TransactionWithId>(true),
  defineCellTag<TransactionWithId>(),
];

export default function TableTrash({ data }: TableTrashProps) {
  return (
    <Table<TransactionWithId>
      url="/api/transaction"
      tag="transaction"
      data={data}
      columns={columns}
      options={[{ name: "Restore", icon: MdRestore, component: RestoreByIdModal }]}
      groupOptions={[{ name: "Restore", icon: MdRestore, component: GroupRestoreByIdModal }]}
    />
  );
}
