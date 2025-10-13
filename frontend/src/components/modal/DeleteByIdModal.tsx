import React from "react";
import Modal, { ModalProps } from "./Modal";
import { del } from "@/app/api/fetch";


export interface DeleteByIdModalProps extends ModalProps {
    url: string;
    id: string;
}

export default function DeleteByIdModal({ url, id, open, onClose }: DeleteByIdModalProps) {
    async function submit() {
        const { error } = await del(`${url}/${id}`);
        if (error) alert(`Error: ${error.message}`);
        else onClose();
    }

    return (
        <Modal open={open} onClose={onClose} cancellable onDelete={submit}>
            <p>Are you sure you want to delete {id}?</p>
        </Modal>
    );
}
