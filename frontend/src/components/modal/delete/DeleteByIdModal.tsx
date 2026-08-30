import Modal, { BackendModalProps } from "../Modal";
import { del } from "@/app/api/fetch";
import { Item } from "../../table/Table";

interface DeleteBackendModalProps<T extends Item> extends BackendModalProps<T> {
  name?: keyof T;
}

export default function DeleteByIdModal<T extends Item>({ url, item, name, open, onClose }: DeleteBackendModalProps<T>) {
  async function submit() {
    const { error } = await del(`${url}/${item?._id}`);
    if (error != null) alert(`Error: ${error}`);
    else onClose();
  }

  return (
    <Modal open={open} onClose={onClose} cancellable onDelete={submit}>
      <p>Are you sure you want to delete {name ? `"${item?.[name]}"` : item?._id}?</p>
    </Modal>
  );
}
