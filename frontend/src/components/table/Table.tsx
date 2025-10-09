'use client';

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import EditButton from "./EditButton";
import DeleteButton from "./DeleteButton";
import { twMerge } from "tailwind-merge";
import AddButton from "./AddButton";

const classes = {
    table: "w-full min-w-[640px] text-sm",
    thead: "bg-second-bg",
    colgroup: {
        select: "w-4",
        options: "w-12",
        add: "w-4 p-2",
    },
    row: {
        base: "border-b last:border-0 border-second-bg hover:bg-second-bg transition-colors",
        selected: "bg-second-bg",
        add: "text-subtext"
    },
    th: "text-left text-xs uppercase tracking-wider px-3 py-2 select-none",
    td: "px-3 py-2 align-center",
}

export interface Item {
    _id: string;
}

export interface TableProps {
    data: Item[];
    columns: ColumnDef<Item>[];
    hideCreating?: boolean;
}

const selectColumn: ColumnDef<Item> = {
    id: "select",
    header: ({ table }) => (
        <input
            type="checkbox"
            checked={table.getIsAllRowsSelected?.() ?? false}
            onChange={table.getToggleAllRowsSelectedHandler?.()}
        />
    ),
    cell: ({ row }) => (
        <input
            type="checkbox"
            checked={row.getIsSelected?.() ?? false}
            onChange={row.getToggleSelectedHandler?.()}
        />
    ),
};

const optionsColumn: ColumnDef<Item> = {
    id: "options",
    header: "Options",
    cell: ({ row }) => (
        <div className="flex justify-evenly space-x-2">
            <EditButton item={row.original} />
            <DeleteButton item={row.original} />
        </div>
    )
};

export default function Table({ data, columns, hideCreating }: TableProps) {
    const columnsWithActions = useMemo(() => [selectColumn, ...columns, optionsColumn], [columns]);
    const columnSizes = useMemo(() => ({
        0: classes.colgroup.select,
        [columns.length + 1]: classes.colgroup.options,
    }), [columns.length]);

    const table = useReactTable({
        data,
        columns: columnsWithActions,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <table className={classes.table}>
            {/* header */}
            <thead className={classes.thead}>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header, i) => (
                            <th key={header.id} className={twMerge(classes.th, columnSizes[i])}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
                {/* data */}
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className={twMerge(classes.row.base, row.getIsSelected() && classes.row.selected)}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className={classes.td}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                {/* add new row */}
                {!hideCreating &&
                    <tr className={twMerge(classes.row.base, classes.row.add)}>
                        <td className={twMerge(classes.td, classes.colgroup.add)}><AddButton /></td>
                        <td className={classes.td} rowSpan={columns.length}>Create new</td>
                    </tr>
                }
            </tbody>
            {/* footer */}
            <tfoot>
                {table.getFooterGroups().map(footerGroup => (
                    <tr key={footerGroup.id}>
                        {footerGroup.headers.map(header => (
                            <th key={header.id} className={classes.th}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.footer, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
            </tfoot>
        </table>
    );
}
