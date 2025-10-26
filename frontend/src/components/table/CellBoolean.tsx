import { MdCheck, MdClose } from "react-icons/md";

export interface CellBooleanProps {
  value?: boolean;
}

export default function CellBoolean({ value }: CellBooleanProps) {
  return (
    value ? <MdCheck size={20} className="text-positive w-full" /> : <MdClose size={20} className="text-negative w-full" />
  )
}
