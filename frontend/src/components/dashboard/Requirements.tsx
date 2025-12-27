import CellValue from "../table/cells/CellValue";
import React from "react";
import CellBoolean from "../table/cells/CellBoolean";
import { twMerge } from "tailwind-merge";
import ErrorToast from "../toast/ErrorToast";
import { getRequiredAccountsInput, getRequiredAccountsOutput, getRequiredCardsTransactions } from "@/app/api/getters";

const classes = {
  container: "flex gap-2 w-full",
  section: "flex flex-col gap-1 flex-1",
  item: "text-sm flex flex-nowrap whitespace-nowrap pl-3 w-full max-w-60",
  name: "flex-1 whitespace-nowrap overflow-hidden text-ellipsis",
  fulfilled: "text-subtext",
  unfulfilled: "text-negative",
}

export default async function Requirements() {
  const { response: incomes, error: incomesError } = await getRequiredAccountsInput();
  const { response: outcomes, error: outcomesError } = await getRequiredAccountsOutput();
  const { response: transactions, error: transactionsError } = await getRequiredCardsTransactions();

  const segments = [
    { title: "income", data: incomes || [], error: incomesError, format: true },
    { title: "outcome", data: outcomes || [], error: outcomesError, format: true },
    { title: "transactions", data: transactions || [], error: transactionsError, format: false },
  ]

  return (
    <div className={classes.container}>
      {segments.map(({ title, data, error, format }) => (
        <div key={title} className={classes.section}>
          <h3>Required {title}:</h3>
          {error
            ? <ErrorToast message={`Failed to load required ${title}:\n${error}`} />
            : (<ul>
              {data.map((item, i) => (
                <li key={i} className={twMerge(classes.item, item.remaining <= 0 ? classes.fulfilled : classes.unfulfilled)}>
                  <span className={classes.name}>{item.name}</span>
                  {format ? <CellValue value={item.remaining} currency={item.currency} /> : <span>{item.remaining}</span>}
                  <CellBoolean value={item.remaining <= 0} />
                </li>
              ))}
            </ul>)}
        </div>
      ))}
    </div>
  );
}
