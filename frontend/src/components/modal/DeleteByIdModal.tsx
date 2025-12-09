import React from "react";
import Modal, { BackendModalProps } from "./Modal";
import { del } from "@/app/api/fetch";
import { ItemID } from "../table/Table";


export default function DeleteByIdModal<TID extends ItemID>({ url, item, open, onClose }: BackendModalProps<TID>) {
    async function submit() {
        const { error } = await del(`${url}/${item?._id}`);
        if (error) alert(`Error: ${error.message}`);
        else onClose();
    }

    return (
        <Modal open={open} onClose={onClose} cancellable onDelete={submit}>
            <p>Are you sure you want to delete {item?._id}?</p>
        </Modal>
    );
}
