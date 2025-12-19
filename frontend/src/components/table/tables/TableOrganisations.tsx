'use client';

import { OrganisationWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { defineCellIcon } from "../cells/CellIcon";
import UpdateOrganisationModal from "@/components/modal/update/UpdateOrganisationModal";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";
import { MdDelete, MdEdit } from "react-icons/md";
import { defineCellTag } from "../cells/CellTag";


interface TableOrganisationsProps {
  data: OrganisationWithId[];
}

const columns: ColumnDef<OrganisationWithId>[] = [
  { accessorKey: "pattern", header: "Pattern" },
  { accessorKey: "name", header: "Name" },
  defineCellIcon<OrganisationWithId>(),
  defineCellTag<OrganisationWithId>(),
];

export default function TableOrganisations({ data }: TableOrganisationsProps) {
  return (
    <Table<OrganisationWithId>
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
