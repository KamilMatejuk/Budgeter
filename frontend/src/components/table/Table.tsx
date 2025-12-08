'use client';

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import DeleteByIdModal from "../modal/DeleteByIdModal";
import UpdateModal from "../modal/UpdateModal";
import { customRevalidateTag } from "@/app/api/fetch";
import { COLUMNS } from "./columns";


const classes = {
    container: "overflow-auto",
    table: "w-full min-w-[640px] text-sm m-0",
    thead: "bg-second-bg",
    row: {
        base: "border-b last:border-0 border-second-bg hover:bg-second-bg transition-colors",
        selected: "bg-second-bg",
        add: "cursor-pointer text-subtext"
    },
    th: "text-left text-xs uppercase tracking-wider px-4 py-2 select-none whitespace-nowrap",
    td: "px-4 py-2 align-middle whitespace-nowrap",
    options: {
        th: "text-end w-12",
        container: "flex justify-end space-x-2",
        edit: "cursor-pointer",
        delete: "cursor-pointer",
        add: "w-4 px-3 py-1"
    }
}

export interface Item { _id?: string } // generic type for items without id
export interface ItemID extends Item { _id: string } // generic type for items with id

interface TableProps<TID extends ItemID> {
    url: string;
    tag: string;
    data: TID[];
    columns: (keyof typeof COLUMNS)[];
    hideCreating?: boolean;
    newText?: string;
}

export default function Table<T extends Item, TID extends ItemID>({ url, tag, data, columns, hideCreating, newText }: TableProps<TID>) {
    const [selectedItem, setSelectedItem] = useState<TID | null>(null);
    const [modalOpen, setModalOpen] = useState<"create" | "update" | "delete" | null>(null);
    const handleEdit = (item: TID) => { setSelectedItem(item); setModalOpen("update") };
    const handleDelete = (item: TID) => { setSelectedItem(item); setModalOpen("delete") };
    const handleCreate = () => { setSelectedItem(null); setModalOpen("create") };
    const closeModal = async () => { setSelectedItem(null); setModalOpen(null); customRevalidateTag(tag) };

    const table = useReactTable({
        data,
        columns: useMemo(() => [COLUMNS.select, ...columns.map(col => COLUMNS[col])] as ColumnDef<TID>[], [columns]),
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className={classes.container}>
            <table className={classes.table}>
                {/* header */}
                <thead className={classes.thead}>
                    {table.getHeaderGroups().map((headerGroup, i) => (
                        <tr key={`${headerGroup.id}-${i}`}>
                            {headerGroup.headers.map((header, i) => (
                                <th key={`${header.id}-${i}`} className={twMerge(classes.th, i == 0 && "w-4")}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                            <th className={twMerge(classes.th, classes.options.th)}>options</th>
                        </tr>
                    ))}
                </thead>
                {/* data */}
                <tbody>
                    {table.getRowModel().rows.map((row, i) => (
                        <tr key={`${row.id}-${i}`} className={twMerge(classes.row.base, row.getIsSelected() && classes.row.selected)}>
                            {row.getVisibleCells().map((cell, i) => (
                                <td key={`${cell.id}-${i}`} className={classes.td}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                            <td className={classes.td}>
                                <div className={classes.options.container}>
                                    <MdEdit size={20} className={classes.options.edit} onClick={() => handleEdit(row.original)} />
                                    <MdDelete size={20} className={classes.options.delete} onClick={() => handleDelete(row.original)} />
                                </div>
                            </td>
                        </tr>
                    ))}
                    {/* add new row */}
                    {!hideCreating &&
                        <tr className={twMerge(classes.row.base, classes.row.add)} onClick={handleCreate}>
                            <td className={twMerge(classes.td, classes.options.add)}><MdAdd size={20} /></td>
                            <td className={classes.td} colSpan={columns.length + 1}>Create new {newText || ""}</td>
                        </tr>
                    }
                </tbody>
            </table>
            {/* modals */}
            {selectedItem && modalOpen === "delete" && <DeleteByIdModal open onClose={closeModal} url={url} id={selectedItem._id} />}
            {(modalOpen === "update" || modalOpen === "create") && <UpdateModal open onClose={closeModal} url={url} item={selectedItem || {} as T} />}
        </div>
    );
}
