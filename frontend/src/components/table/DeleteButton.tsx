import { Item } from "./Table";
import { MdDelete } from "react-icons/md";

export interface DeleteButtonProps {
  item: Item;
}

export default function DeleteButton({ item }: DeleteButtonProps) {
  return (
    <MdDelete size={20} className="cursor-pointer text-negative" onClick={() => console.log(`Delete ${item._id}`)}/>
  );
}
