'use client';

import { StockAccountWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellValue from "../cells/CellValue";
import { Currency } from "@/types/enum";
import UpdateStockAccountModal from "@/components/modal/update/UpdateStockAccountModal";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";
import { MdDelete, MdEdit } from "react-icons/md";


interface TableStocksProps {
  data: StockAccountWithId[];
}

const columns: ColumnDef<StockAccountWithId>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "value", header: "Value", cell: ({ row }) => <CellValue value={row.original.value} currency={row.original.currency as Currency} />, meta: { alignedRight: true } },
  { accessorKey: "number", header: "Number" },
  { accessorKey: "yearly_interest", header: "Yearly Interest", cell: ({ row }) => row.original.yearly_interest.toFixed(1) + "%" },
];

export default function TableStocks({ data }: TableStocksProps) {
  return (
    <Table<StockAccountWithId>
      url="/api/products/stock_account"
      tag="stock_account"
      newText="stock account"
      data={data}
      columns={columns}
      options={[
        { name: "Edit", icon: MdEdit, component: UpdateStockAccountModal },
        { name: "Delete", icon: MdDelete, component: DeleteByIdModal },
      ]}
      CreateModal={UpdateStockAccountModal} />
  );
}
