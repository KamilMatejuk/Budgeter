'use client';

import React, { useState } from "react";
import { motion, Transition, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { FaBars } from "react-icons/fa";
import Navigation from "./Navigation";
import Header from "./Header";
import Accounts, { AccountsProps } from "./Accounts";


const width = 300;
export const transition = {
  type: "spring",
  duration: 500,
  stiffness: 300,
  damping: 30
} as Transition;
export const spanTransition = (collapsed: boolean, fullWidth: boolean = false) => ({
  x: collapsed ? -8 : 0,
  width: collapsed ? 0 : fullWidth ? '100%' : width * 0.95,
  opacity: collapsed ? 0 : 1,
});

interface SidebarClientProps {
  accountsProps: Omit<AccountsProps, 'collapsed' | 'fullWidth'>;
}


export default function SidebarClient({ accountsProps }: SidebarClientProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : width }}
        transition={transition}
        className={twMerge(
          "hidden md:flex h-screen p-2 flex-col shrink-0",
          collapsed ? "shadow-[inset_0_0_12px_0_rgba(0,0,0,0.2)]" : "shadow-[0_0_12px_0_rgba(0,0,0,0.2)]"
        )}
      >
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        <Navigation collapsed={collapsed} />
        <Accounts {...accountsProps} collapsed={collapsed} />
      </motion.aside>

      {/* Mobile: floating open button (shown when sidebar is closed) */}
      <AnimatePresence>
        {!mobileOpen && (
          <motion.button
            key="fab"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={() => setMobileOpen(true)}
            className="md:hidden fixed top-3 left-3 z-[9999] p-2.5 rounded-md bg-white shadow-[0_0_12px_0_rgba(0,0,0,0.2)] hover:bg-gray-100"
          >
            <FaBars size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile: full-screen sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={transition}
            className="md:hidden fixed inset-0 z-50 flex flex-col bg-white p-2 overflow-y-auto shadow-[0_0_12px_0_rgba(0,0,0,0.2)]"
          >
            <Header collapsed={false} setCollapsed={setCollapsed} onClose={() => setMobileOpen(false)} fullWidth />
            <Navigation collapsed={false} onNavigate={() => setMobileOpen(false)} fullWidth />
            <Accounts {...accountsProps} collapsed={false} fullWidth />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
