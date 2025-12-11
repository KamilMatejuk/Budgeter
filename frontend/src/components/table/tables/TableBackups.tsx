'use client';

import { BackupResponse } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { MdDelete, MdEdit, MdRestore } from "react-icons/md";
import DeleteByNameModal from "@/components/modal/delete/DeleteByNameModal";
import UpdateBackupModal from "@/components/modal/update/UpdateBackupModal";
import RestoreBackupModal from "@/components/modal/custom/RestoreBackupModal";
import CellBoolean from "../cells/CellBoolean";


interface TableBackupsProps {
  data: BackupResponse[];
}

const columns: ColumnDef<BackupResponse>[] = [
  { accessorKey: "name", header: "Name", meta: { wrap: true } },
  { accessorKey: "auto", header: "Manual", cell: ({ row }) => <CellBoolean value={!row.original.auto} /> },
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
      options={[
        { name: "Restore", icon: MdRestore, component: RestoreBackupModal },
        { name: "Edit", icon: MdEdit, component: UpdateBackupModal },
        { name: "Delete", icon: MdDelete, component: DeleteByNameModal },
      ]}
      CreateModal={UpdateBackupModal}
      newText="backup" />
  );
}
