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
  { accessorKey: "description", header: "Description", meta: { wrap: true } },
  {
    accessorKey: "tagsIn",
    header: "Tags (including)",
    cell: ({ row }) => (
      !row.original.tagsIn || !row.original.tagsIn.length ? "Everything" : (
        <div className="flex gap-1">
          {row.original.tagsIn.map((t) => <CellTag key={t._id} tag={t} />)}
        </div>
      )
    )
  },
  {
    accessorKey: "tagsOut",
    header: "Tags (excluding)",
    cell: ({ row }) => (
      !row.original.tagsOut || !row.original.tagsOut.length ? "Nothing" : (
        <div className="flex gap-1">
          {row.original.tagsOut.map((t) => <CellTag key={t._id} tag={t} />)}
        </div>
      )
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
