import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import TableBackups from "../../components/table/tables/TableBackups";
import { getBackups } from "../api/getters";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Backups" };

export default async function Backups() {
  const { response, error } = await getBackups();
  return (
    <>
      <PageHeader text="Backups History" subtext="Overview of your recent backups" />
      {error != null
        ? <ErrorToast message={`Could not download backups: ${error}`} />
        : <TableBackups data={response} />
      }
    </>
  );
}
