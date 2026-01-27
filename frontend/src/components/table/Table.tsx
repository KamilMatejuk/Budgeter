'use client';

import { ColumnDef, ExpandedState, flexRender, getCoreRowModel, TableOptions, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { MdAdd, MdRemove } from "react-icons/md";
import { LuDot } from "react-icons/lu";
import { customRevalidateTag } from "@/app/api/fetch";
import { BackendModalProps, GroupBackendModalProps } from "../modal/Modal";
import { IconBaseProps } from "react-icons";
import { getExpandedRowModel } from "@tanstack/react-table";


const classes = {
  row: "border-b last:border-0 border-second-bg hover:bg-second-bg transition-colors",
  selectedRow: "bg-second-bg",
  th: "text-left text-xs uppercase tracking-wider p-2 select-none whitespace-nowrap",
  td: "p-2 align-middle whitespace-nowrap",
}

export interface Item { _id: string } // generic type for items with id


interface Option<T extends Item> {
  name: string;
  icon: React.ComponentType<IconBaseProps>;
  component: React.ComponentType<BackendModalProps<T>>
}
interface GroupOption<T extends Item> {
  name: string;
  icon: React.ComponentType<IconBaseProps>;
  component: React.ComponentType<GroupBackendModalProps<T>>
}
interface TableProps<T extends Item> {
  url: string;
  tag: string;
  data: T[];
  columns: ColumnDef<T>[];
  options?: Option<T>[];
  groupOptions?: GroupOption<T>[];
  CreateModal?: React.ComponentType<BackendModalProps<T>>;
  newText?: string;
  expandChild?: keyof T;
}

function defineColumnExpand<T extends Item>(): ColumnDef<T> {
  return {
    id: "expander",
    header: () => null,
    cell: ({ row }) => (
      row.getCanExpand()
        ? row.getIsExpanded()
          ? <MdRemove size={20} onClick={row.getToggleExpandedHandler()} style={{ cursor: "pointer", marginLeft: 15 * row.depth }} />
          : <MdAdd size={20} onClick={row.getToggleExpandedHandler()} style={{ cursor: "pointer", marginLeft: 15 * row.depth }} />
        : <LuDot size={20} style={{ opacity: 0.5, marginLeft: 15 * row.depth }} />
    ),
  };
}

function updateFirstColumnWithIndent<T extends Item>(columns: ColumnDef<T>[]) {
  if (columns.length === 0) return [];
  const firstColumn = {
    ...columns[0],
    cell: (props) => {
      const cell = columns[0].cell;
      return (
        <div style={{ marginLeft: 15 * props.row.depth }}>
          {typeof cell === "function"
            ? cell(props)
            : cell}
        </div>
      );
    },
  } as ColumnDef<T>;
  return [firstColumn, ...columns.slice(1)];
}

function defineColumnSelect<T extends Item>(): ColumnDef<T> {
  return {
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
  };
}

function defineColumnOptions<T extends Item>(
  options: Option<T>[],
  setSelectedItem: React.Dispatch<React.SetStateAction<T | null>>,
  setSelectedModal: React.Dispatch<React.SetStateAction<number | null>>
): ColumnDef<T> {
  return {
    id: "options",
    header: "Options",
    cell: ({ row }) => (
      <div className="flex justify-end space-x-2">
        {options.map(({ name, icon: Icon }, index) => (
          <Icon size={20} title={name} className="cursor-pointer" key={index}
            onClick={() => { setSelectedItem(row.original); setSelectedModal(index + 1) }} />))}
      </div>
    ),
    meta: { align: "right" },
  };
}

export default function Table<T extends Item>({ url, tag, data, columns, options, groupOptions, CreateModal, newText, expandChild }: TableProps<T>) {
  // modals types are indexed as: 0 - create, 1+ - custom options, 1+n+ - group options
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [selectedModal, setSelectedModal] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<ExpandedState>(() => ({}));

  const allColumns = useMemo(() => ([
    expandChild && defineColumnExpand<T>(),
    groupOptions && groupOptions.length > 0 && defineColumnSelect<T>(),
    ...(expandChild ? updateFirstColumnWithIndent<T>(columns) : columns),
    options && options.length > 0 && defineColumnOptions<T>(options, setSelectedItem, setSelectedModal),
  ] as ColumnDef<T>[]).filter(Boolean), [columns, options]);

  const expandableTableProps: Partial<TableOptions<T>> = expandChild ? {
    state: { expanded },
    onExpandedChange: setExpanded,
    getSubRows: row => row[expandChild] as T[],
    getRowCanExpand: row => (row.original[expandChild] as T[]).length > 0,
    getExpandedRowModel: getExpandedRowModel(),
  } : {}
  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId: row => row._id,
    getCoreRowModel: getCoreRowModel(),
    ...expandableTableProps,
  })
  const headers = table.getHeaderGroups().flatMap(headerGroup => headerGroup.headers)
  const closeModal = async () => {
    setSelectedItem(null);
    setSelectedModal(null);
    table.resetRowSelection();
    await customRevalidateTag(tag);
  };

  return (
    <div>
      {groupOptions && <div className={twMerge(
        "flex justify-start items-center gap-2 p-2 pt-0",
        table.getSelectedRowModel().rows.length < 2 && "pointer-events-none text-gray-300"
      )}>
        <span>Group options ({table.getSelectedRowModel().rows.length} selected):</span>
        {groupOptions.map(({ name, icon: Icon }, index) => (
          <Icon size={20} key={index} title={name} className="cursor-pointer"
            onClick={() => { setSelectedModal(index + 1 + (options?.length || 0)) }} />
        ))}
      </div>}
      <table className="w-full text-sm m-0 table-auto">
        {/* header */}
        <thead className="bg-second-bg">
          <tr>
            {headers.map((header, i) => (
              <th key={`${header.id}-${i}`} className={twMerge(
                classes.th,
                header.id === "select" && "w-4 px-4",
                header.id === "expander" && "pr-0",
                header.column.columnDef.meta?.align == "right" && "text-right",
                header.column.columnDef.meta?.align == "center" && "text-center",
                ["left", "both"].includes(header.column.columnDef.meta?.border || "") && "border-l border-line",
                ["right", "both"].includes(header.column.columnDef.meta?.border || "") && "border-r border-line",
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
                  cell.column.id === "select" && "px-4",
                  cell.column.id === "expander" && "pr-0",
                  cell.column.columnDef.meta?.wrap && "whitespace-normal break-words",
                  cell.column.columnDef.meta?.wrapForce && "whitespace-normal break-all",
                  cell.column.columnDef.meta?.ellipsis && "whitespace-nowrap overflow-hidden text-ellipsis",
                  cell.column.columnDef.meta?.align == "right" && "text-right",
                  cell.column.columnDef.meta?.align == "center" && "text-center",
                  ["left", "both"].includes(cell.column.columnDef.meta?.border || "") && "border-l border-line",
                  ["right", "both"].includes(cell.column.columnDef.meta?.border || "") && "border-r border-line",
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
      {options?.map(({ component: Option }, index) => (
        selectedModal === index + 1 && <Option open onClose={closeModal} url={url} item={selectedItem} key={index} />
      ))}
      {groupOptions?.map(({ component: Option }, index) => (
        selectedModal === index + 1 + (options?.length || 0) && <Option open onClose={closeModal} url={url} items={table.getSelectedRowModel().rows.map(row => row.original)} key={index} />
      ))}
    </div>
  );
}
