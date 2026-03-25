'use client';

import { CapitalInvestmentRichWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellValue, { defineCellValue } from "../cells/CellValue";
import UpdateCapitalInvestmentModal from "@/components/modal/update/UpdateCapitalInvestmentModal";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";
import { MdDelete, MdEdit } from "react-icons/md";
import CellDate from "../cells/CellDate";
import { getMonthsBetweenDates } from "@/const/date";
import { Currency } from "@/types/enum";
import { defineCellBoolean } from "../cells/CellBoolean";


interface TableInvestmentsProps {
  data: CapitalInvestmentRichWithId[];
}

const columns: ColumnDef<CapitalInvestmentRichWithId>[] = [
  { accessorKey: "name", header: "Name" },
  defineCellValue<CapitalInvestmentRichWithId>(),
  { accessorKey: "yearly_interest", header: "Yearly Interest",
    meta: { align: 'center' },
    cell: ({ row }) => row.original.yearly_interest.toFixed(1) + "%",
  },
  { accessorKey: "estimated_return", header: "Estimated Return",
    meta: { align: 'center' },
    cell: ({ row }) => {
      const length = getMonthsBetweenDates(new Date(row.original.start), new Date(row.original.end))
      const rate = Math.pow(1 + row.original.yearly_interest / 100, length / 12);
      const profit = (rate - 1.0) * row.original.value_pln;
      const taxedProfit = profit * 0.81;
      return <CellValue value={taxedProfit} colour currency={Currency.PLN} />
    },
  },
  { accessorKey: "start", header: "Start Date", cell: ({ row }) => <CellDate value={row.original.start} showDelta /> },
  { accessorKey: "end", header: "End Date", cell: ({ row }) => <CellDate value={row.original.end} showDelta /> },
  { accessorKey: "capitalization", header: "Capitalization", meta: { align: 'center' } },
  defineCellBoolean<CapitalInvestmentRichWithId>("withdrawable", "Withdraw"),
];

export default function TableInvestments({ data }: TableInvestmentsProps) {
  return (
    <Table<CapitalInvestmentRichWithId>
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
