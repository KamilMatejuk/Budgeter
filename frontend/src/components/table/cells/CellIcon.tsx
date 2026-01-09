import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

interface CellIconProps {
  source: string;
  alt?: string;
}


export default function CellIcon({ source, alt }: CellIconProps) {
  return source &&
    <div className="relative w-5 h-5">
      <Image src={source} alt={alt || "icon"} fill />
    </div>;
}

export function defineCellIcon<T extends { icon?: string | null, name?: string }>() {
  return {
    accessorKey: "icon",
    header: "Icon",
    cell: ({ row }) => <CellIcon source={row.original.icon || ""} alt={row.original.name} />
  } as ColumnDef<T>;
}
