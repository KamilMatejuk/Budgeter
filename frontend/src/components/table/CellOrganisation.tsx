import { useQuery } from "@tanstack/react-query";
import { get } from "@/app/api/fetch";
import { OrganisationWithId } from "@/types/backend";
import CellIcon from "./CellIcon";


export interface CellOrganisationProps {
  name: string;
}


export default function CellOrganisation({ name }: CellOrganisationProps) {
  const { data: organisation } = useQuery({
    queryKey: ["organisation", name],
    queryFn: async () => {
      const { response } = await get<OrganisationWithId>(`/api/organisation/regex/${name}`, ["organisation"]);
      return response;
    },
  });

  return (
    <div className="flex items-center gap-2">
      {organisation && organisation.icon && <CellIcon source={organisation.icon} alt={organisation.name} />}
      <p>{organisation?.name || name}</p>
    </div>
  );
}
