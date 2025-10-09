import { Item } from "./Table";
import { MdEdit } from "react-icons/md";

export interface EditButtonProps {
  item: Item;
}

export default function EditButton({ item }: EditButtonProps) {
  return (
    <MdEdit size={20}  onClick={() => console.log(`Edit ${item._id}`)}/>
  );
}
