'use client';

import { Cash, CashWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellValue from "../cells/CellValue";
import { Currency } from "@/types/enum";


interface TableCashProps {
  data: CashWithId[];
}

const columns: ColumnDef<CashWithId>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "value", header: "Value", cell: ({ row }) => <CellValue value={row.original.value} currency={row.original.currency as Currency} /> },
];

export default function TableCash({ data }: TableCashProps) {
  return (
    <Table<Cash, CashWithId>
      url="/api/products/cash"
      tag="cash"
      newText="cash"
      data={data}
      columns={columns} />
  );
}
