import React from "react";
import Modal, { ModalProps } from "./Modal";
import { patch, post } from "@/app/api/fetch";
import { Item } from "../table/Table";


export interface UpdateModalProps<T extends Item> extends ModalProps {
    url: string;
    item: T;
}

export default function UpdateModal<T extends Item>({ url, item, open, onClose }: UpdateModalProps<T>) {
    async function submit() {
        const method = item ? patch : post;
        const { error } = await method(url, item);
        if (error) alert(`Error: ${error.message}`);
        onClose();
    }

    return (
        <Modal open={open} onClose={onClose} cancellable onSave={submit}>
            <p>{item._id ? `Update ${item}` : "Create new"}</p>
            {/* TODO switch based on item type */}
        </Modal>
    );
}
