'use client';

import { MonthlyExpenseWithId, MonthlyIncomeWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellValue from "../cells/CellValue";
import { Currency } from "@/types/enum";
import { MdDelete, MdEdit } from "react-icons/md";
import DeleteByIdModal from "@/components/modal/DeleteByIdModal";
import UpdateRecurringMonthlyModal from "@/components/modal/UpdateRecurringMonthlyModal";

type RecurringProductWithId = MonthlyIncomeWithId | MonthlyExpenseWithId;
interface TableRecurringProductsProps {
  data: RecurringProductWithId[];
  type: "income" | "expense"
}

const columns: ColumnDef<RecurringProductWithId>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "value", header: "Value", cell: ({ row }) => <CellValue value={row.original.value} currency={row.original.currency as Currency} />, meta: { alignedRight: true } },
  { accessorKey: "day_of_month", header: "Day of Month" },
];

export default function TableRecurringProducts({ data, type }: TableRecurringProductsProps) {
  return (
    <Table<RecurringProductWithId>
      url={`/api/products/monthly_${type}`}
      tag={`monthly_${type}`}
      newText={`monthly ${type}`}
      data={data}
      columns={columns}
      options={[
        { name: "Edit", icon: MdEdit, component: UpdateRecurringMonthlyModal },
        { name: "Delete", icon: MdDelete, component: DeleteByIdModal },
      ]}
      CreateModal={UpdateRecurringMonthlyModal} />
  );
}
