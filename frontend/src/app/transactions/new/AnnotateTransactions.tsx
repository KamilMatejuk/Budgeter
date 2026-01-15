'use client';

import { TransactionRichWithId } from "@/types/backend";
import TableTransactions from "@/components/table/tables/TableTransactions";
import AnnotateTransactionsModal from "@/components/modal/custom/AnnotateTransactionsModal";
import { useState } from "react";
import ButtonWithLoader from "@/components/button/ButtonWithLoader";
import { customRevalidateTag } from "@/app/api/fetch";

interface AnnotateTransactionsProps {
  transactions: TransactionRichWithId[];
}

export default function AnnotateTransactions({ transactions }: AnnotateTransactionsProps) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [item, setItem] = useState<TransactionRichWithId>(transactions[currentIndex]);

  const onClose = async () => {
    setOpen(false);
    setCurrentIndex(0);
    await customRevalidateTag("transaction");
    setItem(transactions[0]);
  }
  const onSuccessfulSave = async () => {
    if (currentIndex + 1 < transactions.length) {
      setOpen(false);
      setCurrentIndex(currentIndex + 1);
      setItem(transactions[currentIndex + 1]);
      setTimeout(() => setOpen(true), 1000);
    } else onClose();
  }
  return (
    <>
      <ButtonWithLoader
        text="Annotate"
        action="positive"
        onClick={async () => setOpen(true)}
        className="w-full"
      />
      <TableTransactions data={transactions}/>
      {open &&
        <AnnotateTransactionsModal
          open
          item={item}
          url="/api/transaction"
          onClose={onClose}
          onCancel={onSuccessfulSave}
          onSuccessfulSave={onSuccessfulSave}
          counter={currentIndex + 1}
          total={transactions.length}
        />
      }
    </>
  );
}
