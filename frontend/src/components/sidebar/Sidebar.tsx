'use client';

import React, { useState } from "react";
import { motion, Transition } from "framer-motion";
import { twMerge } from "tailwind-merge";
import Navigation from "./Navigation";
import Header from "./Header";
import Accounts from "./Accounts";


export const transition = {
  type: "spring",
  duration: 500,
  stiffness: 300,
  damping: 30
} as Transition;
export const spanTransition = (collapsed: boolean) => ({
  x: collapsed ? -8 : 0,
  width: collapsed ? 0 : 240,
  opacity: collapsed ? 0 : 1,
});


export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={transition}
      className={twMerge("h-screen p-2 flex flex-col", collapsed ? "shadow-[inset_0_0_12px_0_rgba(0,0,0,0.2)]" : "shadow-[0_0_12px_0_rgba(0,0,0,0.2)]")}
    >
      {/* HEADER */}
      <Header collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* accounts (with nonzero value) */}
      <Accounts collapsed={collapsed} />

      {/* cards and accounts with not-met limits this month */}

      {/* NAV */}
      <Navigation collapsed={collapsed} />
    </motion.aside>
  );
}
