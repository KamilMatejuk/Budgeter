import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GoHome } from "react-icons/go";
import { IoSaveOutline, IoSettingsOutline, IoTrashOutline } from "react-icons/io5";
import { TfiImport } from "react-icons/tfi";
import { CiViewList } from "react-icons/ci";
import { spanTransition } from "./SidebarClient";
import { IoIosSearch } from "react-icons/io";


type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const items: NavItem[] = [
  { label: "Home", href: "/", icon: <GoHome size={24} /> },
  { label: "Import", href: "/import", icon: <TfiImport size={20} /> },
  { label: "Transactions", href: "/transactions", icon: <CiViewList size={24} /> },
  { label: "Search", href: "/search", icon: <IoIosSearch size={24} /> },
  { label: "Settings", href: "/settings", icon: <IoSettingsOutline size={24} /> },
  { label: "Backups", href: "/backups", icon: <IoSaveOutline size={22} /> },
  { label: "Trash", href: "/trash", icon: <IoTrashOutline size={24} /> },
]

const classes = {
  container: "flex-1 overflow-hidden py-3",
  list: "space-y-1 px-1",
  item: "group flex items-center gap-3 px-2 py-2 rounded-md hover:bg-second-bg",
  icon: "flex-shrink-0 w-6 h-6 flex items-center justify-center",
  label: "overflow-hidden whitespace-nowrap text-sm",
}


interface NavigationProps {
  collapsed: boolean;
}


export default function Navigation({ collapsed }: NavigationProps) {
  return (
    <nav className={classes.container}>
      <ul className={classes.list}>
        {items.map((it) => (
          <li key={it.label}>
            <Link href={it.href} className={classes.item}>
              <span className={classes.icon}>{it.icon}</span>
              <motion.span initial={false} animate={spanTransition(collapsed)} className={classes.label}>
                {it.label}
              </motion.span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
