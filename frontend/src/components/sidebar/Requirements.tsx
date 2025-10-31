'use client';

import { motion } from "framer-motion";
import WarningToast from "../toast/WarningToast";
import { spanTransition } from "./Sidebar";
import { useEffect, useState } from "react";
import { RequirementsResponse } from "@/types/backend";
import { get } from "@/app/api/fetch";

const classes = {
  container: "flex-1 overflow-hidden py-3 flex flex-col justify-center gap-1",
  toast: "text-sm p-2 min-w-[240px]",
}


interface RequirementsProps {
  collapsed: boolean;
}


export default function Requirements({ collapsed }: RequirementsProps) {
  const [transactions, setTransactions] = useState<RequirementsResponse[]>([]);
  const [incomes, setIncomes] = useState<RequirementsResponse[]>([]);
  const [outcomes, setOutcomes] = useState<RequirementsResponse[]>([]);
  useEffect(() => {
    get<RequirementsResponse[]>("/api/history/requirements/cards", [])
      .then(({ response }) => response && setTransactions(response));
  }, []);
  useEffect(() => {
    get<RequirementsResponse[]>("/api/history/requirements/accounts/in", [])
      .then(({ response }) => response && setIncomes(response));
  }, []);
  useEffect(() => {
    get<RequirementsResponse[]>("/api/history/requirements/accounts/out", [])
      .then(({ response }) => response && setOutcomes(response));
  }, []);

  const cardMessage = "Those cards didn't reach this month's required transactions:\n" +
    transactions.map(it => `- ${it.name} (${it.remaining} remaining)`).join("\n");

  const amountIncomingMessage = "Those accounts didn't reach this month's required income:\n" +
    incomes.map(it => `- ${it.name} (${it.remaining.toFixed(2)} remaining)`).join("\n");

  const amountOutgoingMessage = "Those accounts didn't reach this month's required outcome:\n" +
    outcomes.map(it => `- ${it.name} (${it.remaining.toFixed(2)} remaining)`).join("\n");

  return (
    <motion.div initial={false} animate={spanTransition(collapsed)} className={classes.container}>
      {transactions.length > 0 && (
        <WarningToast className={classes.toast} message={cardMessage} />
      )}
      {incomes.length > 0 && (
        <WarningToast className={classes.toast} message={amountIncomingMessage} />
      )}
      {outcomes.length > 0 && (
        <WarningToast className={classes.toast} message={amountOutgoingMessage} />
      )}
    </motion.div>
  );
}
