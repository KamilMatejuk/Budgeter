import { MdAdd } from "react-icons/md";

export default function AddButton() {
  return (
    <MdAdd size={20} className="cursor-pointer" onClick={() => console.log(`Add new item`)}/>
  );
}
