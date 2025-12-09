'use client';

import { BackupResponse } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";


interface TableBackupsProps {
  data: BackupResponse[];
}

const columns: ColumnDef<BackupResponse>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "timestamp", header: "Timestamp", cell: ({ row }) => new Date(row.original.timestamp).toLocaleString('pl-PL') },
  { accessorKey: "size_mb", header: "Size", cell: ({ row }) => row.original.size_mb.toFixed(2) + " MB" },
  { accessorKey: "description", header: "Description", meta: { wrap: true } },
];

export default function TableBackups({ data }: TableBackupsProps) {
  return (
    <Table<BackupResponse>
      url="/api/backup"
      tag="backup"
      data={data}
      columns={columns}
      options={[]} />
  );
}
