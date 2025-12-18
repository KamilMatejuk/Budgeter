'use client';

import { TransactionWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import CellOrganisation from "../cells/CellOrganisation";
import { defineCellValue } from "../cells/CellValue";
import { defineCellAccountName } from "../cells/CellAccountName";
import { MdCallSplit, MdDelete, MdEdit } from "react-icons/md";
import { BsFillPiggyBankFill } from "react-icons/bs";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";
import UpdateTransactionModal from "@/components/modal/update/UpdateTransactionModal";
import CellTag from "../cells/CellTag";
import SplitTransactionModal from "@/components/modal/custom/SplitTransactionModal";
import DebtRepayTransactionModal from "@/components/modal/custom/DebtRepayTransactionModal";


interface TableTransactionsProps {
  data: TransactionWithId[];
}

const columns: ColumnDef<TransactionWithId>[] = [
  { accessorKey: "date", header: "Date" },
  defineCellAccountName<TransactionWithId>(),
  { accessorKey: "title", header: "Title", meta: { wrapForce: true } },
  { accessorKey: "organisation", header: "Organisation", meta: { wrap: true }, cell: ({ row }) => <CellOrganisation name={row.original.organisation} /> },
  defineCellValue<TransactionWithId>(),
  {

    accessorKey: "tags", header: "Tags", cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.tags.map((tagId) => <CellTag key={tagId} id={tagId} />)}
      </div>
    ), meta: { wrap: true }
  },
];

export default function TableTransactions({ data }: TableTransactionsProps) {
  return (
    <Table<TransactionWithId>
      url="/api/transaction"
      tag="transaction"
      data={data}
      columns={columns}
      options={[
        { name: "Edit", icon: MdEdit, component: UpdateTransactionModal },
        { name: "Split", icon: MdCallSplit, component: SplitTransactionModal },
        { name: "Debt/Repay", icon: BsFillPiggyBankFill, component: DebtRepayTransactionModal },
        { name: "Delete", icon: MdDelete, component: DeleteByIdModal },
      ]} />
  );
}
