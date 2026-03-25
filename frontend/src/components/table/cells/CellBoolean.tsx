import { ColumnDef } from "@tanstack/react-table";
import { MdCheck, MdClose } from "react-icons/md";

interface CellBooleanProps {
  value?: boolean;
}

export default function CellBoolean({ value }: CellBooleanProps) {
  return (
    value ? <MdCheck size={20} className="text-positive" /> : <MdClose size={20} className="text-negative" />
  )
}

export function defineCellBoolean<T>(key: keyof T, title: string) {
  return {
    accessorKey: key,
    header: title,
    meta: { align: 'center' },
    cell: ({ row }) => (<div className="flex justify-center">
      <CellBoolean value={row.original[key] as boolean} />
    </div>)
  } as ColumnDef<T>;
}
