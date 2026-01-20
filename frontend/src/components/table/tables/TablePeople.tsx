'use client';

import { OrganisationRichWithId } from "@/types/backend";
import Table from "@/components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";
import { MdDelete, MdEdit } from "react-icons/md";
import { defineCellTag } from "../cells/CellTag";
import UpdatePeopleModal from "@/components/modal/update/UpdatePeopleModal";


interface TablePeopleProps {
  data: OrganisationRichWithId[];
}

const columns: ColumnDef<OrganisationRichWithId>[] = [
  { accessorKey: "name", header: "Name" },
  defineCellTag<OrganisationRichWithId>(),
];

export default function TablePeople({ data }: TablePeopleProps) {
  return (
    <Table<OrganisationRichWithId>
      url="/api/organisation"
      tag="organisation"
      newText="person"
      data={data}
      columns={columns}
      options={[
        { name: "Edit", icon: MdEdit, component: UpdatePeopleModal },
        { name: "Delete", icon: MdDelete, component: DeleteByIdModal },
      ]}
      CreateModal={UpdatePeopleModal} />
  );
}
