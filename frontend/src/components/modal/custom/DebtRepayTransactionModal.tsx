import React from "react";
import { BackendModalProps } from "../Modal";
import { TransactionOrgWithId } from "@/types/backend";
import DebtTransactionModal from "./DebtTransactionModal";
import RepayTransactionModal from "./RepayTransactionModal";


export default function DebtRepayTransactionModal({ url, item, open, onClose }: BackendModalProps<TransactionOrgWithId>) {
  return item && (
    item.value < 0
      ? <DebtTransactionModal url={url} item={item} open={open} onClose={onClose} />
      : <RepayTransactionModal url={url} item={item} open={open} onClose={onClose} />
  );
}
