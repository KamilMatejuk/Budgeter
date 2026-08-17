'use client';

import { BudgetRichWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";
import { MdDelete, MdEdit } from "react-icons/md";
import { CellTag, defineCellTag } from "../cells/CellTag";
import { defineCellValue } from "../cells/CellValue";
import UpdateBudgetModal from "@/components/modal/update/UpdateBudgetModal";


interface TableBudgetsProps {
  data: BudgetRichWithId[];
}

const columns: ColumnDef<BudgetRichWithId>[] = [
  { accessorKey: "name", header: "Name" },
  {
    ...defineCellTag<BudgetRichWithId>(),
    cell: ({ row }) => (
        row.original.tags ? (
          <div className="flex gap-1">
            {row.original.tags.map((t) => <CellTag key={t._id} tag={t} />)}
          </div>
        ) : "Everything"
      )
    },
  defineCellValue<BudgetRichWithId>(),
];

export default function TableBudgets({ data }: TableBudgetsProps) {
  return (
    <Table<BudgetRichWithId>
      url="/api/products/budget"
      tag="budget"
      newText="budget"
      data={data}
      columns={columns}
      options={[
        { name: "Edit", icon: MdEdit, component: UpdateBudgetModal },
        { name: "Delete", icon: MdDelete, component: DeleteByIdModal },
      ]}
      CreateModal={UpdateBudgetModal}
      />
  );
}
