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
import CellTag, { defineCellTag } from "../cells/CellTag";
import SplitTransactionModal from "@/components/modal/custom/SplitTransactionModal";
import DebtRepayTransactionModal from "@/components/modal/custom/DebtRepayTransactionModal";
import { getDateString } from "@/const/date";


interface TableTransactionsProps {
  data: TransactionWithId[];
}

const columns: ColumnDef<TransactionWithId>[] = [
  { accessorKey: "date", header: "Date", cell: ({ row }) => getDateString(new Date(row.original.date)) },
  defineCellAccountName<TransactionWithId>(),
  { accessorKey: "title", header: "Title", meta: { wrapForce: true } },
  { accessorKey: "organisation", header: "Organisation", meta: { wrap: true }, cell: ({ row }) => <CellOrganisation name={row.original.organisation} /> },
  defineCellValue<TransactionWithId>(true),
  defineCellTag<TransactionWithId>(),
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
