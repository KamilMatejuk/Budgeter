import React from "react";
import { TransactionRichWithId } from "@/types/backend";
import { FaArrowRight } from "react-icons/fa";
import CellAccountName from "../../table/cells/CellAccountName";
import CellOrganisation from "../../table/cells/CellOrganisation";
import CellValue from "../../table/cells/CellValue";
import { getDateString } from "@/const/date";

interface TransactionDetailsProps {
  item: TransactionRichWithId
}

export default function TransactionDetails({ item }: TransactionDetailsProps) {
  return (
    <>
      <div className="flex justify-center"><CellValue value={item.value} currency={item.currency} colour /></div>
      <div className="flex justify-center">{getDateString(item.date)}</div>
      <div className="flex justify-center">{item.title}</div>
      <div className="flex gap-3 items-center justify-center">
        <div className="m-auto"><CellAccountName account={item.account} cash={item.cash} /></div>
        <FaArrowRight className="" />
        <div className="m-auto"><CellOrganisation organisation={item.organisation} /></div>
      </div>
    </>
  );
}
