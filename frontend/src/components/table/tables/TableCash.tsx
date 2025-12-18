'use client';

import { CashWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { defineCellValue } from "../cells/CellValue";
import UpdateCashModal from "@/components/modal/update/UpdateCashModal";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";
import { MdDelete, MdEdit } from "react-icons/md";


interface TableCashProps {
  data: CashWithId[];
}

const columns: ColumnDef<CashWithId>[] = [
  { accessorKey: "name", header: "Name" },
  defineCellValue<CashWithId>(),
];

export default function TableCash({ data }: TableCashProps) {
  return (
    <Table<CashWithId>
      url="/api/products/cash"
      tag="cash"
      newText="cash"
      data={data}
      columns={columns}
      options={[
        { name: "Edit", icon: MdEdit, component: UpdateCashModal },
        { name: "Delete", icon: MdDelete, component: DeleteByIdModal },
      ]}
      CreateModal={UpdateCashModal} />
  );
}
