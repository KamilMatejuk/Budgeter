'use client';

import { CapitalInvestmentWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellValue from "../cells/CellValue";
import { Currency } from "@/types/enum";
import UpdateCapitalInvestmentModal from "@/components/modal/update/UpdateCapitalInvestmentModal";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";
import { MdDelete, MdEdit } from "react-icons/md";


interface TableInvestmentsProps {
  data: CapitalInvestmentWithId[];
}

const columns: ColumnDef<CapitalInvestmentWithId>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "value", header: "Value", cell: ({ row }) => <CellValue value={row.original.value} currency={row.original.currency as Currency} />, meta: { alignedRight: true } },
  { accessorKey: "yearly_interest", header: "Yearly Interest", cell: ({ row }) => row.original.yearly_interest.toFixed(1) + "%" },
  { accessorKey: "capitalization", header: "Capitalization" },
  { accessorKey: "start", header: "Start Date" },
  { accessorKey: "end", header: "End Date" },
];

export default function TableInvestments({ data }: TableInvestmentsProps) {
  return (
    <Table<CapitalInvestmentWithId>
      url="/api/products/capital_investment"
      tag="capital_investment"
      newText="capital investment"
      data={data}
      columns={columns}
      options={[
        { name: "Edit", icon: MdEdit, component: UpdateCapitalInvestmentModal },
        { name: "Delete", icon: MdDelete, component: DeleteByIdModal },
      ]}
      CreateModal={UpdateCapitalInvestmentModal} />
  );
}
