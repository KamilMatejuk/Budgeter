import Image from "next/image";

export interface CellIconProps {
  source: string;
  alt?: string;
}

export default function CellIcon({ source, alt }: CellIconProps) {
  return (<Image src={source} alt={alt || "icon"} width={20} height={20} />);
}
