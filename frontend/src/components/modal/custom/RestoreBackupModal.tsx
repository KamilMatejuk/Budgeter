import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { BackupResponse } from "@/types/backend";
import { customRevalidateAllTags, post } from "@/app/api/fetch";


export default function RestoreBackupModal({ url, item, open, onClose }: BackendModalProps<BackupResponse>) {
  async function submit() {
    const { error } = await post(`${url}/restore/${item?.name}`, {});
    if (error) alert(`Error: ${error.message}`);
    else {
      await customRevalidateAllTags();
      return onClose()
    };
  };

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={submit} title="Restore Backup" saveText="Restore">
      <p>Are you sure you want to restore the backup &quot;{item?.name}&quot;?</p>
    </Modal>
  );
}
