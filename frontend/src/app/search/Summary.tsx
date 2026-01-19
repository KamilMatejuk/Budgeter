import { TransactionRichWithId } from "@/types/backend";
import { convertToPLN } from "../api/forex";

const classes = {
  container: "flex flex-row justify-evenly items-center gap-8",
  item: "flex flex-col justify-center items-center",
  value: "text-2xl font-semibold",
  label: "text-sm text-subtext",
}

interface SummaryProps {
  data: TransactionRichWithId[];
}

export default async function Summary({ data }: SummaryProps) {
  const totalTransactions = data.length;
  const valuesInPLN = await Promise.all(
    data.map(transaction => convertToPLN(transaction.value, transaction.currency))
  );
  const totalValue = valuesInPLN.reduce((acc, val) => acc + val, 0);
  const totalPosValue = valuesInPLN
    .filter((_, idx) => data[idx].value > 0)
    .reduce((acc, val) => acc + val, 0);
  const totalNegValue = valuesInPLN
    .filter((_, idx) => data[idx].value < 0)
    .reduce((acc, val) => acc - val, 0);

  return (
    <div className={classes.container}>
      <div className={classes.item}>
        <p className={classes.value}>{totalTransactions}</p>
        <p className={classes.label}>Total transactions</p>
      </div>
      <div className={classes.item}>
        <p className={classes.value}>{totalPosValue.toFixed(2)} zł</p>
        <p className={classes.label}>Total earned</p>
      </div>

      <div className={classes.item}>
        <p className={classes.value}>{totalNegValue.toFixed(2)} zł</p>
        <p className={classes.label}>Total spent</p>
      </div>
      <div className={classes.item}>
        <p className={classes.value}>{totalValue.toFixed(2)} zł</p>
        <p className={classes.label}>Total value</p>
      </div>
    </div>
  );
}
