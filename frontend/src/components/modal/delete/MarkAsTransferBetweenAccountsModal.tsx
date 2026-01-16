import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { patch } from "@/app/api/fetch";
import { TransactionRichWithId } from "@/types/backend";


export default function MarkAsTransferBetweenAccountsModal({ url, item, open, onClose }: BackendModalProps<TransactionRichWithId>) {
  async function submit() {
    const body = { _id: item?._id, transfer_between_accounts: true, deleted: true } as Partial<TransactionRichWithId>;
    const { error } = await patch(url, body);
    if (error) alert(`Error: ${error.message}`);
    else onClose();
  }

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={submit} title="Mark transaction as transfer between accounts or investment">
      <p>Are you sure you want to mark {item?._id}?</p>
    </Modal>
  );
}
