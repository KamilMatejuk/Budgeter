import { get } from "../api/fetch";
import { OrganisationWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import ErrorToast from "@/components/toast/ErrorToast";

export default async function Organisations() {
  const { response, error } = await get<OrganisationWithId[]>("/api/organisation", ["organisation"]);

  return (
    error
      ? <ErrorToast message={`Could not download organisations: ${error.message}`} />
      : <Table<OrganisationWithId, OrganisationWithId>
        url="/api/organisation"
        tag="organisation"
        newText="organisation"
        data={response}
        columns={["pattern", "name", "icon"]} />
  );
}
