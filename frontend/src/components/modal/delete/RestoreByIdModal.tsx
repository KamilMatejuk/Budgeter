import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { post } from "@/app/api/fetch";
import { Item } from "../../table/Table";


export default function RestoreByIdModal<T extends Item>({ url, item, open, onClose }: BackendModalProps<T>) {
  async function submit() {
    const { error } = await post(`${url}/restore/${item?._id}`, {});
    if (error != null) alert(`Error: ${error}`);
    else onClose();
  }

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={submit} saveText="Restore">
      <p>Are you sure you want to restore {item?._id}?</p>
    </Modal>
  );
}
