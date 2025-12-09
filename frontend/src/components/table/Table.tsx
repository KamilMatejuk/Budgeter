'use client';

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { MdAdd } from "react-icons/md";
import { customRevalidateTag } from "@/app/api/fetch";
import { BackendModalProps } from "../modal/Modal";
import { IconBaseProps } from "react-icons";


const classes = {
    container: "overflow-auto",
    table: "w-full min-w-[640px] text-sm m-0",
    thead: "bg-second-bg",
    row: {
        base: "border-b last:border-0 border-second-bg hover:bg-second-bg transition-colors",
        selected: "bg-second-bg",
        add: "cursor-pointer text-subtext"
    },
    th: "text-left text-xs uppercase tracking-wider p-2 select-none whitespace-nowrap",
    td: "p-2 align-middle whitespace-nowrap",
    options: {
        th: "text-end w-12",
        container: "flex justify-end space-x-2",
        icon: "cursor-pointer",
        add: "w-4 px-3 py-1"
    }
}

export interface Item { _id?: string } // generic type for items without id
export interface ItemID extends Item { _id: string } // generic type for items with id

interface TableProps<TID extends ItemID> {
    url: string;
    tag: string;
    data: TID[];
    columns: ColumnDef<TID>[];
    options: { name: string; icon: React.ComponentType<IconBaseProps>; component: React.ComponentType<BackendModalProps<TID>> }[];
    CreateModal?: React.ComponentType<BackendModalProps<TID>>;
    newText?: string;
}


export default function Table<TID extends ItemID>({ url, tag, data, columns, options, CreateModal, newText }: TableProps<TID>) {
    // modals types are indexed as: 0 - create, 1+ - custom options
    const [selectedItem, setSelectedItem] = useState<TID | null>(null);
    const [selectedModal, setSelectedModal] = useState<number | null>(null);
    const closeModal = async () => { setSelectedItem(null); setSelectedModal(null); customRevalidateTag(tag) };

    const table = useReactTable({
        data,
        getCoreRowModel: getCoreRowModel(),
        columns: useMemo(() => [
            {
                id: "select",
                header: ({ table }) => (<input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected?.() ?? false}
                    onChange={table.getToggleAllRowsSelectedHandler?.()}
                />),
                cell: ({ row }) => (<input
                    type="checkbox"
                    checked={row.getIsSelected?.() ?? false}
                    onChange={row.getToggleSelectedHandler?.()}
                />),
            },
            ...columns,
            {
                id: "options",
                header: "Options",
                cell: ({ row }) => (
                    <div className="flex justify-end space-x-2">
                        {options.map(({ name, icon: Icon }, index) => (
                            <Icon
                                size={20}
                                title={name}
                                className={classes.options.icon}
                                onClick={() => { setSelectedItem(row.original); setSelectedModal(index + 1) }} key={index}
                            />))}
                    </div>
                ),
                meta: { alignedRight: true },
            },
        ] as ColumnDef<TID>[], [columns, options]),
    })
    const headers = table.getHeaderGroups().flatMap(headerGroup => headerGroup.headers)

    return (
        <div className={classes.container}>
            <table className={classes.table}>
                {/* header */}
                <thead className={classes.thead}>
                    <tr>
                        {headers.map((header, i) => (
                            <th key={`${header.id}-${i}`} className={twMerge(
                                classes.th,
                                i == 0 && "w-4 px-4",
                                header.column.columnDef.meta?.alignedRight && "text-right",
                            )}>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                </thead>
                {/* data */}
                <tbody>
                    {table.getRowModel().rows.map((row, i) => (
                        <tr key={`${row.id}-${i}`} className={twMerge(classes.row.base, row.getIsSelected() && classes.row.selected)}>
                            {row.getVisibleCells().map((cell, i) => (
                                <td key={`${cell.id}-${i}`} className={twMerge(
                                    classes.td,
                                    i == 0 && "px-4",
                                    cell.column.columnDef.meta?.wrap && "whitespace-normal break-words",
                                    cell.column.columnDef.meta?.ellipsis && "whitespace-nowrap overflow-hidden text-ellipsis",
                                    cell.column.columnDef.meta?.alignedRight && "text-right",
                                )}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {/* add new row */}
                    {CreateModal &&
                        <tr className={twMerge(classes.row.base, classes.row.add)} onClick={() => { setSelectedItem(null); setSelectedModal(0) }}>
                            <td className={twMerge(classes.td, classes.options.add)}><MdAdd size={20} /></td>
                            <td className={classes.td} colSpan={columns.length + 1}>Create new {newText || ""}</td>
                        </tr>
                    }
                </tbody>
            </table>
            {/* option modals */}
            {CreateModal && selectedModal === 0 && <CreateModal open onClose={closeModal} url={url} item={selectedItem} />}
            {options.map(({ component: Option }, index) => (
                selectedModal === index + 1 && <Option open onClose={closeModal} url={url} item={selectedItem} key={index} />
            ))}
        </div>
    );
}
