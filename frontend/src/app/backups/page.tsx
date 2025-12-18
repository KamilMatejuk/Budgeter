import { BackupResponse } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import { get } from "../api/fetch";
import TableBackups from "../../components/table/tables/TableBackups";


export default async function Backups() {
  const { response, error } = await get<BackupResponse[]>(`/api/backup`, ["backup"]);
  return (
    <>
      <PageHeader text="Backups History" subtext="Overview of your recent backups" />
      {error
        ? <ErrorToast message="Could not download backups" />
        : <TableBackups data={response} />
      }
    </>
  );
}
