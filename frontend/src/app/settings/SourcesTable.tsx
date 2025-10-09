import { get } from "../api/fetch";
import { SourceWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import ErrorToast from "@/components/toast/ErrorToast";

export default async function SourcesTable() {
  const { response: sources, error } = await get<SourceWithId[]>("/api/source");

  if (error) return <ErrorToast message={`Could not download sources: ${error.message}`} />;

  return (
    <Table data={sources} columns={[{ accessorKey: "name", header: "Name" }]} />
  );
}
