'use client';

import React, { useState } from "react";
import Link from "next/link";
import { motion, Transition } from "framer-motion";
import { FaChevronLeft } from "react-icons/fa";
import { GoHome } from "react-icons/go";
import { IoSettingsOutline } from "react-icons/io5";
import { TfiImport } from "react-icons/tfi";
import { CiViewList } from "react-icons/ci";


export type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const items: NavItem[] = [
  { label: "Home", href: "/", icon: <GoHome size={24} /> },
  { label: "Transactions", href: "/transactions", icon: <CiViewList size={24} /> },
  { label: "Import", href: "/import", icon: <TfiImport size={24} /> },
  { label: "Settings", href: "/settings", icon: <IoSettingsOutline size={24} /> },
]

const classes = {
  aside: "h-screen p-2 flex flex-col border-r border-line",
  header: "flex items-center justify-between p-2 border-b border-line",
  name: "overflow-hidden whitespace-nowrap",
  collapseButton: "p-2 rounded-md hover:bg-second-bg",
  navigation: {
    container: "flex-1 overflow-auto py-3",
    list: "space-y-1 px-1",
    item: "group flex items-center gap-3 px-2 py-2 rounded-md hover:bg-second-bg",
    icon: "flex-shrink-0 w-6 h-6 flex items-center justify-center text-text",
    label: "overflow-hidden whitespace-nowrap text-sm",
  },
}

const transition = { type: "spring", duration: 500, stiffness: 300, damping: 30 } as Transition;


export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside initial={false} animate={{ width: collapsed ? 64 : 256 }} transition={transition} className={classes.aside}>
      {/* HEADER */}
      <div className={classes.header}>
        <motion.span
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -8 : 0, width: collapsed ? 0 : 256 }}
          className={classes.name}
        >
          Budgeter
        </motion.span>
        <button onClick={() => setCollapsed((s) => !s)} className={classes.collapseButton}>
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={transition}>
            <FaChevronLeft size={18} />
          </motion.div>
        </button>
      </div>

      {/* NAV */}
      <nav className={classes.navigation.container}>
        <ul className={classes.navigation.list}>
          {items.map((it) => (
            <li key={it.label}>
              <Link href={it.href} className={classes.navigation.item}>
                <span className={classes.navigation.icon}>{it.icon}</span>
                <motion.span
                  initial={false}
                  animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -8 : 0, width: collapsed ? 0 : 256 }}
                  className={classes.navigation.label}
                >
                  {it.label}
                </motion.span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </motion.aside>
  );
}
