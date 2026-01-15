'use client';

import { TransactionOrgWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { defineCellOrganisation } from "../cells/CellOrganisation";
import { defineCellValue } from "../cells/CellValue";
import { defineCellAccountName } from "../cells/CellAccountName";
import { MdRestore } from "react-icons/md";
import { defineCellTag } from "../cells/CellTag";
import { getDateString } from "@/const/date";
import GroupRestoreByIdModal from "@/components/modal/delete/GroupRestoreByIdModal";
import RestoreByIdModal from "@/components/modal/delete/RestoreByIdModal";


interface TableTrashProps {
  data: TransactionOrgWithId[];
}

const columns: ColumnDef<TransactionOrgWithId>[] = [
  { accessorKey: "date", header: "Date", cell: ({ row }) => getDateString(new Date(row.original.date)) },
  defineCellAccountName<TransactionOrgWithId>(),
  { accessorKey: "title", header: "Title", meta: { wrapForce: true } },
  defineCellOrganisation<TransactionOrgWithId>(),
  defineCellValue<TransactionOrgWithId>(true),
  defineCellTag<TransactionOrgWithId>(),
];

export default function TableTrash({ data }: TableTrashProps) {
  return (
    <Table<TransactionOrgWithId>
      url="/api/transaction"
      tag="transaction"
      data={data}
      columns={columns}
      options={[{ name: "Restore", icon: MdRestore, component: RestoreByIdModal }]}
      groupOptions={[{ name: "Restore", icon: MdRestore, component: GroupRestoreByIdModal }]}
    />
  );
}
