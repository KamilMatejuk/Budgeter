import Link from "next/link";
import { IoSettingsOutline } from "react-icons/io5";
import { TfiImport } from "react-icons/tfi";

export default function Header() {
  return (
    <header className="flex items-center justify-center px-4 py-2 bg-second-bg">
      <h1 className="text-2xl"><Link href="/">Budgeter</Link></h1>
      <ul className="absolute end-4 flex gap-4">
        <li><Link href="/import"><TfiImport size={25}/></Link></li>
        <li><Link href="/settings"><IoSettingsOutline size={27}/></Link></li>
      </ul>
    </header>
  );
}
