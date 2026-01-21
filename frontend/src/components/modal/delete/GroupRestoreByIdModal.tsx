import React from "react";
import Modal, { GroupBackendModalProps } from "../Modal";
import { post } from "@/app/api/fetch";
import { Item } from "../../table/Table";


export default function GroupRestoreByIdModal<T extends Item>({ url, items, open, onClose }: GroupBackendModalProps<T>) {
  async function submit() {
    await Promise.all(items.map(async (item) => {
      const { error } = await post(`${url}/restore/${item._id}`, {});
      if (error != null) alert(`Error restoring ${item._id}: ${error}`);
    }));
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={submit} saveText="Restore">
      <p>Are you sure you want to restore {items.length} items?</p>
    </Modal>
  );
}
