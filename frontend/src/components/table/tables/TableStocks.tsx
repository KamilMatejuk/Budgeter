'use client';

import { StockAccount, StockAccountWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellValue from "../cells/CellValue";
import { Currency } from "@/types/enum";


interface TableStocksProps {
  data: StockAccountWithId[];
}

const columns: ColumnDef<StockAccountWithId>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "value", header: "Value", cell: ({ row }) => <CellValue value={row.original.value} currency={row.original.currency as Currency} /> },
  { accessorKey: "number", header: "Number" },
  { accessorKey: "yearly_interest", header: "Yearly Interest", cell: ({ row }) => row.original.yearly_interest.toFixed(1) + "%" },
];

export default function TableStocks({ data }: TableStocksProps) {
  return (
    <Table<StockAccount, StockAccountWithId>
      url="/api/products/stock_account"
      tag="stock_account"
      newText="stock account"
      data={data}
      columns={columns} />
  );
}
