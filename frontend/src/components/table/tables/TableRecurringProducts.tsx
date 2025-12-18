'use client';

import { MonthlyExpenseWithId, MonthlyIncomeWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { defineCellValue } from "../cells/CellValue";
import { MdDelete, MdEdit } from "react-icons/md";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";
import UpdateRecurringMonthlyModal from "@/components/modal/update/UpdateRecurringMonthlyModal";

type RecurringProductWithId = MonthlyIncomeWithId | MonthlyExpenseWithId;
interface TableRecurringProductsProps {
  data: RecurringProductWithId[];
  type: "income" | "expense"
}

const columns: ColumnDef<RecurringProductWithId>[] = [
  { accessorKey: "name", header: "Name" },
  defineCellValue<RecurringProductWithId>(),
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
