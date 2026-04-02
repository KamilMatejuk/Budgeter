import CellValue from "../table/cells/CellValue";
import React from "react";
import CellBoolean from "../table/cells/CellBoolean";
import { twMerge } from "tailwind-merge";
import ErrorToast from "../toast/ErrorToast";
import { getRequiredAccountsInput, getRequiredAccountsOutput, getRequiredCardsTransactions } from "@/app/api/getters";
import { getAccountName } from "../table/cells/AccountNameUtils";
import InfoToast from "../toast/InfoToast";

const classes = {
  container: "flex gap-2 w-full",
  section: "flex flex-col gap-1 flex-1",
  item: "text-sm flex flex-nowrap whitespace-nowrap pl-3 w-full",
  name: "whitespace-nowrap overflow-hidden text-ellipsis",
  dots: "flex-1 mx-1 self-end mb-[5px] h-px bg-[radial-gradient(circle,_theme(colors.subtext)_1px,_transparent_1px)] bg-[length:8px_1px]",
  fulfilled: "text-subtext",
  unfulfilled: "text-negative",
}

export default async function Requirements() {
  const { response: incomes, error: incomesError } = await getRequiredAccountsInput();
  const { response: outcomes, error: outcomesError } = await getRequiredAccountsOutput();
  const { response: transactions, error: transactionsError } = await getRequiredCardsTransactions();

  if (incomes && incomes.length === 0 &&
    outcomes && outcomes.length === 0 &&
    transactions && transactions.length === 0) {
    return <InfoToast message="No requirements found" />;
  }

  const sections = [
    {
      title: "income",
      error: incomesError,
      data: (incomes || []).map(item => ({ name: getAccountName(item.account), remaining: item.remaining, currency: item.account.currency })),
    },
    {
      title: "outcome",
      error: outcomesError,
      data: (outcomes || []).map(item => ({ name: getAccountName(item.account), remaining: item.remaining, currency: item.account.currency })),
    },
    {
      title: "transactions",
      error: transactionsError,
      data: (transactions || []).map(item => ({ name: item.card.name, remaining: item.remaining, currency: undefined })),
    },
  ];

  return (
    <div className={classes.container}>
      {sections.map(({ title, data, error }) => {
        const filtered = data.filter(item => item.remaining > 0);
        if (error == null && filtered.length === 0) return null;
        return (
        <div key={title} className={classes.section}>
          <h3>Required {title}:</h3>
          {error != null
            ? <ErrorToast message={`Failed to load required ${title}:\n${error}`} />
            : (<ul>
              {filtered.map((item, i) => (
                <li key={i} className={twMerge(classes.item, item.remaining <= 0 ? classes.fulfilled : classes.unfulfilled)}>
                  <span className={classes.name}>{item.name}</span>
                  <span className={classes.dots} />
                  {item.currency != null
                    ? <CellValue value={item.remaining} currency={item.currency} />
                    : <span>{item.remaining}</span>}
                  <CellBoolean value={item.remaining <= 0} />
                </li>
              ))}
            </ul>)}
        </div>
        );
      })}
    </div>
  );
}
