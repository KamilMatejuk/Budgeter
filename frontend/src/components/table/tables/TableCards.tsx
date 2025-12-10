'use client';

import { CardWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellBoolean from "../cells/CellBoolean";
import CellAccountName from "../cells/CellAccountName";
import UpdateCardModal from "@/components/modal/update/UpdateCardModal";
import { MdDelete, MdEdit } from "react-icons/md";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";


interface TableCardsProps {
  data: CardWithId[];
}

function renderMinTransactionsMonthly(item: CardWithId): string {
  const amount = item.min_number_of_transactions_monthly;
  return amount ? `${amount} transactions` : "None";
}

const columns: ColumnDef<CardWithId>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "currency", header: "Currency" },
  { accessorKey: "number", header: "Number" },
  { accessorKey: "credit", header: "Credit", cell: ({ row }) => <CellBoolean value={row.original.credit} /> },
  { accessorKey: "active", header: "Active", cell: ({ row }) => <CellBoolean value={row.original.active} /> },
  { accessorKey: "account", header: "Account", cell: ({ row }) => <CellAccountName id={row.original.account} /> },
  { accessorKey: "min_number_of_transactions_monthly", header: "Requirements", cell: ({ row }) => renderMinTransactionsMonthly(row.original) },
];

export default function TableCards({ data }: TableCardsProps) {
  return (
    <Table<CardWithId>
      url="/api/products/card"
      tag="card"
      newText="card"
      data={data}
      columns={columns}
      options={[
        { name: "Edit", icon: MdEdit, component: UpdateCardModal },
        { name: "Delete", icon: MdDelete, component: DeleteByIdModal },
      ]}
      CreateModal={UpdateCardModal} />
  );
}
