import { BackupResponse } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import { get } from "../api/fetch";
import WarningToast from "@/components/toast/WarningToast";
import Table from "@/components/table/Table";


export default async function Backups() {
  const { response: backups, error } = await get<BackupResponse[]>(`/api/backup`, ["backup"]);
  return (
    <>
      <PageHeader text="Backups History" subtext="Overview of your recent backups" />
      {error
        ? <ErrorToast message="Could not download backups" />
        : backups.length == 0
          ? <WarningToast message="No backups found" />
          : <Table<BackupResponse, BackupResponse>
            url="/api/backup"
            tag="backup"
            data={backups}
            columns={["name", "timestamp", "size_mb", "description"]}
            hideCreating />
      }
    </>
  );
}
