import { MdCheck, MdClose } from "react-icons/md";

interface CellBooleanProps {
  value?: boolean;
}

export default function CellBoolean({ value }: CellBooleanProps) {
  return (
    value ? <MdCheck size={20} className="text-positive" /> : <MdClose size={20} className="text-negative" />
  )
}
