'use client';

import { SavingsAccountWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellValue from "../cells/CellValue";
import { Currency } from "@/types/enum";
import UpdateSavingsAccountModal from "@/components/modal/update/UpdateSavingsAccountModal";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";
import { MdDelete, MdEdit } from "react-icons/md";


interface TableSavingsProps {
  data: SavingsAccountWithId[];
}

const columns: ColumnDef<SavingsAccountWithId>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "value", header: "Value", cell: ({ row }) => <CellValue value={row.original.value} currency={row.original.currency as Currency} />, meta: { alignedRight: true } },
  { accessorKey: "number", header: "Number" },
  { accessorKey: "yearly_interest", header: "Yearly Interest", cell: ({ row }) => row.original.yearly_interest.toFixed(1) + "%" },
  { accessorKey: "capitalization", header: "Capitalization" },
];

export default function TableSavings({ data }: TableSavingsProps) {
  return (
    <Table<SavingsAccountWithId>
      url="/api/products/savings_account"
      tag="savings_account"
      newText="savings account"
      data={data}
      columns={columns}
      options={[
        { name: "Edit", icon: MdEdit, component: UpdateSavingsAccountModal },
        { name: "Delete", icon: MdDelete, component: DeleteByIdModal },
      ]}
      CreateModal={UpdateSavingsAccountModal} />
  );
}
