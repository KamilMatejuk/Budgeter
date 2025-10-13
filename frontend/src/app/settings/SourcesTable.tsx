import { get } from "../api/fetch";
import { Source, SourceWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import ErrorToast from "@/components/toast/ErrorToast";

export default async function SourcesTable() {
  const { response: sources, error } = await get<SourceWithId[]>("/api/source", ["source"]);

  if (error) return <ErrorToast message={`Could not download sources: ${error.message}`} />;

  return (
    <Table<Source, SourceWithId> url="/api/source" tag="source" newText="source" data={sources} columns={[{ accessorKey: "name", header: "Name" }]}/>
  );
}
