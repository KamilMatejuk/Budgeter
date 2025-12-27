import ErrorToast from "@/components/toast/ErrorToast";
import TableOrganisations from "@/components/table/tables/TableOrganisations";
import { getOrganisations } from "../api/getters";

export default async function Organisations() {
  const { response, error } = await getOrganisations();

  return (
    error
      ? <ErrorToast message={`Could not download organisations: ${error.message}`} />
      : <TableOrganisations data={response} />
  );
}
