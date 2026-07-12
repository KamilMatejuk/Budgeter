'use client';

import { TransactionRichWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { defineCellOrganisation } from "../cells/CellOrganisation";
import { defineCellValue } from "../cells/CellValue";
import { defineCellAccountName } from "../cells/CellAccountName";
import { MdCallSplit, MdDelete, MdEdit } from "react-icons/md";
import { BsFillPiggyBankFill } from "react-icons/bs";
import { FaTags } from "react-icons/fa";
import { GiSpikyExplosion } from "react-icons/gi";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";
import UpdateTransactionModal from "@/components/modal/update/UpdateTransactionModal";
import { defineCellTag } from "../cells/CellTag";
import SplitTransactionModal from "@/components/modal/custom/SplitTransactionModal";
import DebtRepayTransactionModal from "@/components/modal/custom/DebtRepayTransactionModal";
import { getDateString } from "@/const/date";
import GroupDeleteByIdModal from "@/components/modal/delete/GroupDeleteByIdModal";
import GroupTagTransactionModal from "@/components/modal/custom/GroupTagTransactionModal";
import { BiTransfer } from "react-icons/bi";
import MarkAsTransferBetweenAccountsModal from "@/components/modal/delete/MarkAsTransferBetweenAccountsModal";
import MarkAsOutlierModal from "@/components/modal/delete/MarkAsOutlierModal";


interface TableTransactionsProps {
  data: TransactionRichWithId[];
}

const columns: ColumnDef<TransactionRichWithId>[] = [
  { accessorKey: "date", header: "Date", cell: ({ row }) => getDateString(new Date(row.original.date)) },
  defineCellAccountName<TransactionRichWithId>(),
  { accessorKey: "title", header: "Title", meta: { wrapForce: true } },
  defineCellOrganisation<TransactionRichWithId>(),
  defineCellValue<TransactionRichWithId>(true),
  { accessorKey: "debt_person", header: "Debt", cell: ({ row }) => row.original.debt_person ? row.original.debt_person : "" },
  defineCellTag<TransactionRichWithId>(),
];

export default function TableTransactions({ data }: TableTransactionsProps) {
  return (
    <Table<TransactionRichWithId>
      url="/api/transaction"
      tag="transaction"
      data={data}
      columns={columns}
      options={[
        { name: "Edit", icon: MdEdit, component: UpdateTransactionModal },
        { name: "Split", icon: MdCallSplit, component: SplitTransactionModal },
        { name: "Transfer", icon: BiTransfer, component: MarkAsTransferBetweenAccountsModal },
        { name: "Debt/Repay", icon: BsFillPiggyBankFill, component: DebtRepayTransactionModal, isActive: (i) => !!i.debt_person },
        { name: "Delete", icon: MdDelete, component: DeleteByIdModal },
        { name: "Outlier", icon: GiSpikyExplosion, component: MarkAsOutlierModal, isActive: (i) => !!i.outlier },
      ]}
      groupOptions={[
        { name: "Delete", icon: MdDelete, component: GroupDeleteByIdModal },
        { name: "Tag", icon: FaTags, component: GroupTagTransactionModal },
      ]}
    />
  );
}
