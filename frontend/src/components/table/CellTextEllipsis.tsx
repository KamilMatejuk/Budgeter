export interface CellTextEllipsisProps {
  value?: string;
}

export default function CellTextEllipsis({ value }: CellTextEllipsisProps) {
  return (<p className={"p-0 w-[400px] whitespace-nowrap overflow-hidden text-ellipsis"}>{value}</p>);
}
