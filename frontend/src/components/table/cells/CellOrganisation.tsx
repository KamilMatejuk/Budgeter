import CellIcon from "./CellIcon";
import { useOrganisation } from "@/app/api/query";


interface CellOrganisationProps {
  name: string;
}

export default function CellOrganisation({ name }: CellOrganisationProps) {
  const organisation = useOrganisation(name);
  return (
    <div className="flex items-center gap-2">
      {organisation && organisation.icon && <CellIcon source={organisation.icon} alt={organisation.name} />}
      <p>{organisation?.name || name}</p>
    </div>
  );
}
