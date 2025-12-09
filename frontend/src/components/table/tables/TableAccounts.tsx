'use client';

import { PersonalAccountWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellValue from "../cells/CellValue";
import { Currency } from "@/types/enum";
import DeleteByIdModal from "@/components/modal/DeleteByIdModal";
import UpdatePersonalAccountModal from "@/components/modal/UpdatePersonalAccountModal";
import { MdDelete, MdEdit } from "react-icons/md";


interface TableAccountsProps {
  data: PersonalAccountWithId[];
}

function renderMinAmountMonthly(item: PersonalAccountWithId): string {
  const incoming = item.min_incoming_amount_monthly;
  const outgoing = item.min_outgoing_amount_monthly;
  return [
    incoming ? `${incoming.toFixed(2)} incoming` : null,
    outgoing ? `${outgoing.toFixed(2)} outgoing` : null,
  ].filter(Boolean).join(", ") || "None";
}

const columns: ColumnDef<PersonalAccountWithId>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "value", header: "Value", cell: ({ row }) => <CellValue value={row.original.value} currency={row.original.currency as Currency} />, meta: { alignedRight: true } },
  { accessorKey: "number", header: "Number" },
  { accessorKey: "min_incoming_amount_monthly", header: "Requirements", cell: ({ row }) => renderMinAmountMonthly(row.original) }
];

export default function TableAccounts({ data }: TableAccountsProps) {
  return (
    <Table<PersonalAccountWithId>
      url="/api/products/personal_account"
      tag="personal_account"
      newText="account"
      data={data}
      columns={columns}
      options={[
        { name: "Edit", icon: MdEdit, component: UpdatePersonalAccountModal },
        { name: "Delete", icon: MdDelete, component: DeleteByIdModal },
      ]}
      CreateModal={UpdatePersonalAccountModal} />
  );
}
