'use client';

import { motion } from "framer-motion";
import { spanTransition } from "./SidebarClient";
import { CardWithId, PersonalAccountWithId } from "@/types/backend";
import CellValue from "../table/cells/CellValue";
import { Currency } from "@/types/enum";


const classes = {
  container: "overflow-hidden py-3",
  list: "overflow-x-hidden",
  item: "text-sm flex flex-nowrap whitespace-nowrap justify-between p-1 pl-3 w-full",
  label: "overflow-hidden whitespace-nowrap text-sm",
  total: "text-sm flex flex-nowrap whitespace-nowrap justify-end p-1 pl-3 w-full border-t border-line mt-2",
}


function Section({ title, collapsed, items }: { title: string; collapsed: boolean; items: { name: string, value: number | null, currency: Currency }[] }) {
  return (
    <>
      <motion.span initial={false} animate={spanTransition(collapsed)} className={classes.label}>
        {title}
      </motion.span>
      <motion.ul initial={false} animate={spanTransition(collapsed)} className={classes.list}>
        {items.map((it) => (
          <li key={it.name} className={classes.item}>
            {it.name}
            <CellValue value={it.value || 0} currency={it.currency} colour />
          </li>
        ))}
      </motion.ul>
    </>
  )
}


export interface AccountsProps {
  collapsed: boolean;
  cards: CardWithId[];
  accounts: PersonalAccountWithId[];
  stocks: number;
  capitals: number;
  savings: number;
}


export default function Accounts({ collapsed, cards, accounts, stocks, capitals, savings }: AccountsProps) {
  const total = cards.reduce((acc, it) => acc + (it.value || 0), 0)
    + accounts.reduce((acc, it) => acc + (it.value || 0), 0)
    + savings
    + capitals
    + stocks;

  return (
    <div className={classes.container}>
      <Section title="Cards" collapsed={collapsed} items={cards.map((card) => ({ ...card, currency: card.currency as Currency }))} />
      <Section title="Accounts" collapsed={collapsed} items={accounts.map((account) => ({ ...account, currency: account.currency as Currency }))} />
      <Section title="Investments" collapsed={collapsed} items={[
        { name: "Savings", value: savings, currency: Currency.PLN },
        { name: "Capital", value: capitals, currency: Currency.PLN },
        { name: "Stocks", value: stocks, currency: Currency.PLN },
      ]} />
      <motion.span initial={false} animate={spanTransition(collapsed)} className={classes.total}>
        <CellValue value={total} currency={Currency.PLN} colour />
      </motion.span>
    </div>
  );
}
