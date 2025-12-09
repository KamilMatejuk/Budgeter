'use client';

import { MonthlyExpense, MonthlyExpenseWithId, MonthlyIncome, MonthlyIncomeWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellValue from "../cells/CellValue";
import { Currency } from "@/types/enum";

type RecurringProduct = MonthlyIncome | MonthlyExpense;
type RecurringProductWithId = MonthlyIncomeWithId | MonthlyExpenseWithId;
interface TableRecurringProductsProps {
  data: RecurringProductWithId[];
  type: "income" | "expense"
}

const columns: ColumnDef<RecurringProductWithId>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "value", header: "Value", cell: ({ row }) => <CellValue value={row.original.value} currency={row.original.currency as Currency} /> },
  { accessorKey: "day_of_month", header: "Day of Month" },
];

export default function TableRecurringProducts({ data, type }: TableRecurringProductsProps) {
  return (
    <Table<RecurringProduct, RecurringProductWithId>
      url={`/api/products/monthly_${type}`}
      tag={`monthly_${type}`}
      newText={`monthly ${type}`}
      data={data}
      columns={columns} />
  );
}
