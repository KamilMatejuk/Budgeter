import React from "react";
import { motion } from "framer-motion";
import { spanTransition, transition } from "./Sidebar";
import { FaChevronLeft } from "react-icons/fa";


const classes = {
  header: "flex items-center justify-between p-2 border-b border-line",
  name: "overflow-hidden whitespace-nowrap",
  collapseButton: "p-2 rounded-md hover:bg-second-bg",
}


interface HeaderProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}


export default function Header({ collapsed, setCollapsed }: HeaderProps) {
  return (
    <div className={classes.header}>
      <motion.span initial={false} animate={spanTransition(collapsed)} className={classes.name}>
        Budgeter
      </motion.span>
      <button onClick={() => setCollapsed((s) => !s)} className={classes.collapseButton}>
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={transition}>
          <FaChevronLeft size={18} />
        </motion.div>
      </button>
    </div>
  );
}
