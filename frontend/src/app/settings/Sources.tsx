import { get } from "../api/fetch";
import { Source, SourceWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import ErrorToast from "@/components/toast/ErrorToast";

export default async function Sources() {
  const { response, error } = await get<SourceWithId[]>("/api/source", ["source"]);

  return (
    error
      ? <ErrorToast message={`Could not download sources: ${error.message}`} />
      : <Table<Source, SourceWithId>
        url="/api/source"
        tag="source"
        newText="source"
        data={response}
        columns={[{ accessorKey: "name", header: "Name" }]} />
  );
}
