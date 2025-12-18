import { motion } from "framer-motion";
import WarningToast from "../toast/WarningToast";
import { RequirementsResponse } from "@/types/backend";
import { spanTransition } from "./SidebarClient";
import { formatValue } from "../table/cells/CellValue";


const classes = {
  container: "flex-1 overflow-hidden py-3 flex flex-col justify-center gap-1",
  toast: "text-sm p-2 min-w-[240px]",
}


export interface RequirementsProps {
  collapsed: boolean;
  transactions: RequirementsResponse[];
  incomes: RequirementsResponse[];
  outcomes: RequirementsResponse[];
}


export default function Requirements({ transactions, incomes, outcomes, collapsed }: RequirementsProps) {
  const cardMessage = "Those cards didn't reach this month's required transactions:\n" +
    transactions.map(it => `- ${it.name} (${it.remaining} remaining)`).join("\n");

  const amountIncomingMessage = "Those accounts didn't reach this month's required income:\n" +
    incomes.map(it => `- ${it.name} (${formatValue(it.remaining)} remaining)`).join("\n");

  const amountOutgoingMessage = "Those accounts didn't reach this month's required outcome:\n" +
    outcomes.map(it => `- ${it.name} (${formatValue(it.remaining)} remaining)`).join("\n");

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
