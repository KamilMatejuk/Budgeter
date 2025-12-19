'use client';

import { PersonalAccountWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { defineCellValue, formatValue } from "../cells/CellValue";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";
import UpdatePersonalAccountModal from "@/components/modal/update/UpdatePersonalAccountModal";
import { MdDelete, MdEdit } from "react-icons/md";
import { AiFillDollarCircle } from "react-icons/ai";
import SetAccountValueOnDateModal from "@/components/modal/custom/SetAccountValueOnDateModal";
import { defineCellIcon } from "../cells/CellIcon";


interface TableAccountsProps {
  data: PersonalAccountWithId[];
}

function renderMinAmountMonthly(item: PersonalAccountWithId): string {
  const incoming = item.min_incoming_amount_monthly;
  const outgoing = item.min_outgoing_amount_monthly;
  return [
    incoming ? `${formatValue(incoming, item.currency)} incoming` : null,
    outgoing ? `${formatValue(outgoing, item.currency)} outgoing` : null,
  ].filter(Boolean).join(", ") || "None";
}

const columns: ColumnDef<PersonalAccountWithId>[] = [
  defineCellIcon<PersonalAccountWithId>(),
  { accessorKey: "name", header: "Name" },
  defineCellValue<PersonalAccountWithId>(),
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
        { name: "Set value", icon: AiFillDollarCircle, component: SetAccountValueOnDateModal },
        { name: "Delete", icon: MdDelete, component: DeleteByIdModal },
      ]}
      CreateModal={UpdatePersonalAccountModal} />
  );
}
