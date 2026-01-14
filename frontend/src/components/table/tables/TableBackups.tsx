'use client';

import { BackupResponse } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { MdDelete, MdEdit, MdRestore } from "react-icons/md";
import DeleteByNameModal from "@/components/modal/delete/DeleteByNameModal";
import UpdateBackupModal from "@/components/modal/update/UpdateBackupModal";
import RestoreBackupModal from "@/components/modal/custom/RestoreBackupModal";
import { getDateTimeString } from "@/const/date";
import GroupDeleteByNameModal from "@/components/modal/delete/GroupDeleteByNameModal";
import { FaRobot, FaPerson } from "react-icons/fa6";


interface TableBackupsProps {
  data: BackupResponse[];
}

const columns: ColumnDef<BackupResponse>[] = [
  {
    header: "Creator",
    accessorKey: "auto",
    meta: { align: "center" },
    cell: ({ row }) => row.original.auto ? <FaRobot size={20} className="m-auto" /> : <FaPerson size={20} className="m-auto" />,
  },
  {
    header: "Timestamp",
    accessorKey: "timestamp",
    cell: ({ row }) => getDateTimeString(row.original.timestamp)
  },
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Size",
    accessorKey: "size_mb",
    meta: { align: "center" },
    cell: ({ row }) => row.original.size_mb.toFixed(2) + " MB"
  },
  {
    header: "Description",
    accessorKey: "description",
    meta: { wrap: true },
  },
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
      newText="backup"
      groupOptions={[
        { name: "Delete", icon: MdDelete, component: GroupDeleteByNameModal },
      ]}
    />
  );
}
