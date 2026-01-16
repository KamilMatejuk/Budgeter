'use client';

import { OrganisationRichWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { defineCellIcon } from "../cells/CellIcon";
import UpdateOrganisationModal from "@/components/modal/update/UpdateOrganisationModal";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";
import { MdDelete, MdEdit } from "react-icons/md";
import { defineCellTag } from "../cells/CellTag";
import MultilineText from "@/components/MultilineText";


interface TableOrganisationsProps {
  data: OrganisationRichWithId[];
}

const columns: ColumnDef<OrganisationRichWithId>[] = [
  { accessorKey: "patterns", header: "Pattern", cell: ({ row }) => <MultilineText text={row.original.patterns.join("\n")} /> },
  { accessorKey: "name", header: "Name" },
  defineCellIcon<OrganisationRichWithId>(),
  defineCellTag<OrganisationRichWithId>(),
];

export default function TableOrganisations({ data }: TableOrganisationsProps) {
  return (
    <Table<OrganisationRichWithId>
      url="/api/organisation"
      tag="organisation"
      newText="organisation"
      data={data}
      columns={columns}
      options={[
        { name: "Edit", icon: MdEdit, component: UpdateOrganisationModal },
        { name: "Delete", icon: MdDelete, component: DeleteByIdModal },
      ]}
      CreateModal={UpdateOrganisationModal} />
  );
}
