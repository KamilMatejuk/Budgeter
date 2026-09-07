import ErrorToast from "../toast/ErrorToast";
import { getThisMonthsBudget } from "@/app/api/getters";
import BudgetChart from "./BudgetChart";
import { getThisMonthPassedPercentage } from "@/const/date";
import InfoToast from "../toast/InfoToast";
import WarningToast from "../toast/WarningToast";
import Link from "next/link";
import { getDateSearchSlug } from "@/app/search/utils";

const classes = {
  container: "flex w-full gap-4",
  item: "flex-1 flex flex-col items-center",
  title: "cursor-pointer text-xl font-bold",
  tags: "cursor-pointer my-1 px-2 pt-0 pb-0.5 border rounded bg-gray-100 text-gray-500 border-gray-300",
}

async function SpentInMonthPassedInfo({ spent, spentPercent }: { spent: number, spentPercent: number }) {
  const monthPercent = getThisMonthPassedPercentage();
  // 15 for small values then drops to zero as it nears 100
  // 0    → 15
  // 10   → 12.15
  // 25   → 8.44
  // 50   → 3.75
  // 75   → 0.94
  // 90   → 0.15
  // 100  → 0
  const predictedSpent = spent / monthPercent * 100
  const weightedDecay = (x: number) => 15 * Math.pow(1 - x / 100, 2);
  // if spending is below month passed, everything is ok
  if (spentPercent < monthPercent)
    return <InfoToast
      className="text-sm"
      message={[
        "Great job!",
        "You spend slower then the month passes.",
        `You are on track to spend only ${predictedSpent.toFixed(2)} zł.`
      ].join(" ")}
    />
  // if spending is more than month passed but in the reasonable range
  if (spentPercent < monthPercent + weightedDecay(monthPercent))
    return <WarningToast
      className="text-sm"
      message={[
        "You might want to slow down.",
        "You spend moderately faster than the month passes.",
        `You are on track to spend ${predictedSpent.toFixed(2)} zł.`
      ].join(" ")}
    />
  // if the spending is faster then month passed
  return <ErrorToast
    className="text-sm"
    message={[
      "You are spending too fast!",
      "You spend way faster than the month passes.",
      `You are on track to spend over ${predictedSpent.toFixed(2)} zł.`
      ].join(" ")}
    />
}


export default async function Budget() {
  const { response, error } = await getThisMonthsBudget();
  if (error != null)
    return <ErrorToast message={`Could not download budget: ${error}`} />;
  const allTransactionsUrl = `/search?${getDateSearchSlug()}`;  
  return (
    <div className={classes.container}>
      {response.map(b => 
      <div key={b.budget.name} className={classes.item}>
        <Link
          target="_blank"
          href={[allTransactionsUrl] 
            .concat((b.budget.tagsIn || []).map(t => `tagsIn=${t._id}`))
            .concat((b.budget.tagsOut || []).map(t => `tagsOut=${t._id}`))
            .concat([`tagsInJoin=${b.budget.tagsInJoin}`])
            .concat([`tagsOutJoin=${b.budget.tagsOutJoin}`])
            .join('&')
          }
        >
          <BudgetChart spent={b.value_pln} budget={b.budget.value_pln} />
        </Link>
        <p
          className={classes.title}
          title={b.budget.description}
        >
          {b.budget.name}
        </p>
        <p
          className={classes.tags}
          title={`Including (${b.budget.tagsInJoin}): ${b.budget.tagsIn?.map((t) => t.name).join(", ") || "-"}\n`
            + `Excluding (${b.budget.tagsOutJoin}): ${b.budget.tagsOut?.map((t) => t.name).join(", ") || "-"}\n`}
        >
          {b.budget.tagsIn?.length} tag{b.budget.tagsIn?.length != 1 ? "s" : ""} in&nbsp;
          {b.budget.tagsOut?.length} tag{b.budget.tagsOut?.length != 1 ? "s" : ""} out
        </p>
        <SpentInMonthPassedInfo spent={b.value_pln} spentPercent={b.value_pln / b.budget.value_pln * 100} />
      </div>
      )}
    </div>
  );
}
