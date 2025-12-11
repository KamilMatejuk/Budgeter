import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { del } from "@/app/api/fetch";
import { Item } from "../../table/Table";


export default function DeleteByNameModal<T extends Item & { name: string }>({ url, item, open, onClose }: BackendModalProps<T>) {
  async function submit() {
    const { error } = await del(`${url}/${item?.name}`);
    if (error) alert(`Error: ${error.message}`);
    else onClose();
  }

  return (
    <Modal open={open} onClose={onClose} cancellable onDelete={submit}>
      <p>Are you sure you want to delete &quot;{item?.name}&quot;?</p>
    </Modal>
  );
}
