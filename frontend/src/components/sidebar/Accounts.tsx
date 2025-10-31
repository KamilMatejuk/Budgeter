'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { spanTransition } from "./Sidebar";
import { get } from "@/app/api/fetch";
import { CapitalInvestmentWithId, CardWithId, PersonalAccountWithId, SavingsAccountWithId, StockAccountWithId } from "@/types/backend";
import CellValue from "../table/CellValue";


const classes = {
  container: "overflow-hidden py-3",
  list: "overflow-x-hidden",
  item: "text-sm flex flex-nowrap whitespace-nowrap justify-between p-1 pl-3 w-full",
  label: "overflow-hidden whitespace-nowrap text-sm",
  total: "text-sm flex flex-nowrap whitespace-nowrap justify-end p-1 pl-3 w-full border-t border-line mt-2",
}


function Section({ title, collapsed, items }: { title: string; collapsed: boolean; items: { name: string, value: number | null }[] }) {
  return (
    <>
      <motion.span initial={false} animate={spanTransition(collapsed)} className={classes.label}>
        {title}
      </motion.span>
      <motion.ul initial={false} animate={spanTransition(collapsed)} className={classes.list}>
        {items.map((it) => (
          <li key={it.name} className={classes.item}>
            {it.name}
            <CellValue value={it.value || 0} as_diff />
          </li>
        ))}
      </motion.ul>
    </>
  )
}


interface AccountsProps {
  collapsed: boolean;
}


export default function Accounts({ collapsed }: AccountsProps) {
  const [cards, setCards] = useState<CardWithId[]>([{ name: 'loading...', value: 0 }] as CardWithId[]);
  const [accounts, setAccounts] = useState<PersonalAccountWithId[]>([{ name: 'loading...', value: 0 }] as PersonalAccountWithId[]);
  const [stocks, setStocks] = useState<number>(0);
  const [capitals, setCapitals] = useState<number>(0);
  const [savings, setSavings] = useState<number>(0);
  const total = cards.reduce((acc, it) => acc + (it.value || 0), 0) + accounts.reduce((acc, it) => acc + (it.value || 0), 0) + savings + capitals + stocks;

  useEffect(() => {
    get<CardWithId[]>("/api/products/card", ["card"])
      .then(({ response }) => response && setCards(response.filter((it) => it.credit && it.value)));
  }, []);
  useEffect(() => {
    get<PersonalAccountWithId[]>("/api/products/personal_account", ["personal_account"])
      .then(({ response }) => response && setAccounts(response.filter((it) => it.value)));
  }, []);
  useEffect(() => {
    get<StockAccountWithId[]>("/api/products/stock_account", ["stock_account"])
      .then(({ response }) => response && setStocks(response.reduce((acc, it) => acc + (it.value || 0), 0)));
  }, []);
  useEffect(() => {
    get<CapitalInvestmentWithId[]>("/api/products/capital_investment", ["capital_investment"])
      .then(({ response }) => response && setCapitals(response.reduce((acc, it) => acc + (it.value || 0), 0)));
  }, []);
  useEffect(() => {
    get<SavingsAccountWithId[]>("/api/products/savings_account", ["savings_account"])
      .then(({ response }) => response && setSavings(response.reduce((acc, it) => acc + (it.value || 0), 0)));
  }, []);

  return (
    <div className={classes.container}>
      <Section title="Cards" collapsed={collapsed} items={cards} />
      <Section title="Accounts" collapsed={collapsed} items={accounts} />
      <Section title="Investments" collapsed={collapsed} items={[
        { name: "Savings", value: savings },
        { name: "Capital", value: capitals },
        { name: "Stocks", value: stocks },
      ]} />
      <motion.span initial={false} animate={spanTransition(collapsed)} className={classes.total}>
        <CellValue value={total} as_diff />
      </motion.span>
    </div>
  );
}
