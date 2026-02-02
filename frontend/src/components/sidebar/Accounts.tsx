'use client';

import { motion } from "framer-motion";
import { spanTransition } from "./SidebarClient";
import { CardRichWithId, PersonalAccountRichWithId } from "@/types/backend";
import CellValue from "../table/cells/CellValue";
import { Currency } from "@/types/enum";
import { getAccountName } from "../table/cells/AccountNameUtils";


const classes = {
  container: "overflow-hidden py-3",
  list: "overflow-x-hidden",
  item: "text-sm flex flex-nowrap whitespace-nowrap justify-between p-1 pl-3 w-full",
  label: "overflow-hidden whitespace-nowrap text-sm",
  total: "text-sm flex flex-nowrap whitespace-nowrap justify-end p-1 pl-3 w-full border-t border-line mt-2",
}


function Section({ title, collapsed, items }: { title: string; collapsed: boolean; items: { name: string, value: number | null, currency: Currency | keyof typeof Currency }[] }) {
  return (
    <>
      <motion.span initial={false} animate={spanTransition(collapsed)} className={classes.label}>
        {title}
      </motion.span>
      <motion.ul initial={false} animate={spanTransition(collapsed)} className={classes.list}>
        {items.map((it) => (
          it.value ? (
            <li key={it.name} className={classes.item}>
              {it.name}
              <CellValue value={it.value || 0} currency={it.currency} colour />
            </li>) : null
        ))}
      </motion.ul>
    </>
  )
}


export interface AccountsProps {
  collapsed: boolean;
  cards: CardRichWithId[];
  accounts: PersonalAccountRichWithId[];
  stocks: number;
  capitals: number;
}


export default function Accounts({ collapsed, cards, accounts, stocks, capitals }: AccountsProps) {
  // all values are mapped to PLN on server side
  const currency = Currency.PLN;
  const total = cards.reduce((acc, it) => acc + (it.value || 0), 0)
    + accounts.reduce((acc, it) => acc + (it.value || 0), 0)
    + capitals
    + stocks;

  return (
    <div className={classes.container}>
      <Section title="Cards" collapsed={collapsed} items={cards.map((card) => ({ ...card, currency, value: card.value || null }))} />
      <Section title="Accounts" collapsed={collapsed} items={accounts.map((account) => (
        { value: account.value_pln, name: getAccountName(account), currency }))} />
      <Section title="Investments" collapsed={collapsed} items={[
        { name: "Capital", value: capitals, currency },
        { name: "Stocks", value: stocks, currency },
      ]} />
      <motion.span initial={false} animate={spanTransition(collapsed)} className={classes.total}>
        <CellValue value={total} currency={currency} colour />
      </motion.span>
    </div>
  );
}
