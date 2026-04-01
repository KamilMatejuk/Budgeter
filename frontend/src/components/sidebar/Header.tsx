import React from "react";
import { motion } from "framer-motion";
import { spanTransition, transition } from "./SidebarClient";
import { FaChevronLeft, FaTimes } from "react-icons/fa";


const classes = {
  header: "flex items-center justify-between p-2 border-b border-line",
  name: "overflow-hidden whitespace-nowrap",
  collapseButton: "p-2 rounded-md hover:bg-second-bg",
}


interface HeaderProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
  fullWidth?: boolean;
}


export default function Header({ collapsed, setCollapsed, onClose, fullWidth }: HeaderProps) {
  return (
    <div className={classes.header}>
      <motion.span initial={false} animate={spanTransition(collapsed, fullWidth)} className={classes.name}>
        Budgeter
      </motion.span>
      <button
        onClick={onClose ?? (() => setCollapsed((s) => !s))}
        className={classes.collapseButton}
      >
        {onClose ? (
          <FaTimes size={18} />
        ) : (
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={transition}>
            <FaChevronLeft size={18} />
          </motion.div>
        )}
      </button>
    </div>
  );
}
