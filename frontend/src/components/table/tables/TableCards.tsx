'use client';

import { CardRichWithId, CardWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellBoolean from "../cells/CellBoolean";
import { defineCellAccountName } from "../cells/CellAccountName";
import UpdateCardModal from "@/components/modal/update/UpdateCardModal";
import { MdDelete, MdEdit } from "react-icons/md";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";


interface TableCardsProps {
  data: CardRichWithId[];
}

function renderMinTransactionsMonthly(item: CardRichWithId): string {
  const amount = item.min_number_of_transactions_monthly;
  return amount ? `${amount} transactions` : "None";
}

const columns: ColumnDef<CardRichWithId>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "currency", header: "Currency" },
  { accessorKey: "number", header: "Number" },
  { accessorKey: "credit", header: "Credit", cell: ({ row }) => <CellBoolean value={row.original.credit} /> },
  { accessorKey: "active", header: "Active", cell: ({ row }) => <CellBoolean value={row.original.active} /> },
  defineCellAccountName<CardRichWithId>(),
  { accessorKey: "min_number_of_transactions_monthly", header: "Requirements", cell: ({ row }) => renderMinTransactionsMonthly(row.original) },
];

export default function TableCards({ data }: TableCardsProps) {
  return (
    <Table<CardRichWithId>
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
