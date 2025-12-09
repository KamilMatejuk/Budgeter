import { get } from "../api/fetch";
import { OrganisationWithId } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import TableOrganisations from "@/components/table/tables/TableOrganisations";

export default async function Organisations() {
  const { response, error } = await get<OrganisationWithId[]>("/api/organisation", ["organisation"]);

  return (
    error
      ? <ErrorToast message={`Could not download organisations: ${error.message}`} />
      : <TableOrganisations data={response} />
  );
}
