import { Organisation } from "@/types/backend";
import CellIcon from "./CellIcon";
import { useOrganisation } from "@/app/api/query";
import { ColumnDef } from "@tanstack/react-table";


interface CellOrganisationProps {
  organisation: Organisation;
}

export default function CellOrganisation({ organisation }: CellOrganisationProps) {
  return (
    <div className="flex items-center gap-2">
      {organisation.icon && <CellIcon source={organisation.icon} alt={organisation.name} />}
      <p>{organisation.name}</p>
    </div>
  );
}

export function CellOrganisationId({ id }: { id: string }) {
  const organisation = useOrganisation(id);
  return organisation ? <CellOrganisation organisation={organisation} /> : id;
}


export function defineCellOrganisation<T extends { organisation: string | Organisation }>() {
  return {
    accessorKey: "organisation",
    header: "Organisation",
    meta: { wrap: true },
    cell: ({ row }) => {
      if (typeof row.original.organisation === 'string') return row.original.organisation;
      return <CellOrganisation organisation={row.original.organisation} />
    },
  } as ColumnDef<T>;
}
