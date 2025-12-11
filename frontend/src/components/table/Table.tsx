'use client';

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { MdAdd } from "react-icons/md";
import { customRevalidateTag } from "@/app/api/fetch";
import { BackendModalProps } from "../modal/Modal";
import { IconBaseProps } from "react-icons";


const classes = {
  row: "border-b last:border-0 border-second-bg hover:bg-second-bg transition-colors",
  selectedRow: "bg-second-bg",
  td: "p-2 align-middle whitespace-nowrap",
}

export interface Item { _id: string } // generic type for items with id


interface TableProps<T extends Item> {
  url: string;
  tag: string;
  data: T[];
  columns: ColumnDef<T>[];
  options: { name: string; icon: React.ComponentType<IconBaseProps>; component: React.ComponentType<BackendModalProps<T>> }[];
  CreateModal?: React.ComponentType<BackendModalProps<T>>;
  newText?: string;
}


export default function Table<T extends Item>({ url, tag, data, columns, options, CreateModal, newText }: TableProps<T>) {
  // modals types are indexed as: 0 - create, 1+ - custom options
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
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
              <Icon size={20} title={name} className="cursor-pointer" key={index}
                onClick={() => { setSelectedItem(row.original); setSelectedModal(index + 1) }} />))}
          </div>
        ),
        meta: { alignedRight: true },
      },
    ] as ColumnDef<T>[], [columns, options]),
  })
  const headers = table.getHeaderGroups().flatMap(headerGroup => headerGroup.headers)

  return (
    <>
      <table className="w-full min-w-[640px] text-sm m-0">
        {/* header */}
        <thead className="bg-second-bg">
          <tr>
            {headers.map((header, i) => (
              <th key={`${header.id}-${i}`} className={twMerge(
                "text-left text-xs uppercase tracking-wider p-2 select-none whitespace-nowrap",
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
            <tr key={`${row.id}-${i}`} className={twMerge(classes.row, row.getIsSelected() && classes.selectedRow)}>
              {row.getVisibleCells().map((cell, i) => (
                <td key={`${cell.id}-${i}`} className={twMerge(
                  classes.td,
                  i == 0 && "px-4",
                  cell.column.columnDef.meta?.wrap && "whitespace-normal break-words",
                  cell.column.columnDef.meta?.wrapForce && "whitespace-normal break-all",
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
            <tr className={twMerge(classes.row, "cursor-pointer text-subtext")} onClick={() => { setSelectedItem(null); setSelectedModal(0) }}>
              <td className="w-4 px-3 py-1"><MdAdd size={20} /></td>
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
    </>
  );
}
