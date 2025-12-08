interface CellTextWrapProps {
  value?: string;
}

export default function CellTextWrap({ value }: CellTextWrapProps) {
  return (<p className={"p-0 whitespace-normal break-words"}>{value}</p>);
}
