import React from "react";
import Modal, { GroupBackendModalProps } from "../Modal";
import { del } from "@/app/api/fetch";
import { Item } from "../../table/Table";


export default function GroupDeleteByNameModal<T extends Item & { name: string }>({ url, items, open, onClose }: GroupBackendModalProps<T>) {
  async function submit() {
    await Promise.all(items.map(async (item) => {
      const { error } = await del(`${url}/${item.name}`);
      if (error) alert(`Error deleting ${item.name}: ${error.message}`);
    }));
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} cancellable onDelete={submit}>
      <p>Are you sure you want to delete {items.length} items?</p>
    </Modal>
  );
}
