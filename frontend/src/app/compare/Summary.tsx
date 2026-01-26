import { Comparison } from "@/types/backend";

const classes = {
  container: "flex flex-row justify-evenly items-center gap-8",
  item: "flex flex-col justify-center items-center",
  value: "text-2xl font-semibold",
  label: "text-sm text-subtext",
}

interface SummaryProps {
  data: Comparison[];
}

export default async function Summary({ data }: SummaryProps) {
  const min = Math.min(...data.map(d => d.value));
  const max = Math.max(...data.map(d => d.value));
  const avg = data.reduce((sum, d) => sum + d.value, 0) / data.length;
  return (
    <div className={classes.container}>
      <div className={classes.item}>
        <p className={classes.value}>{min.toFixed(2)} zł</p>
        <p className={classes.label}>Minimal monthly value</p>
      </div>
      <div className={classes.item}>
        <p className={classes.value}>{max.toFixed(2)} zł</p>
        <p className={classes.label}>Maximal monthly value</p>
      </div>
      <div className={classes.item}>
        <p className={classes.value}>{avg.toFixed(2)} zł</p>
        <p className={classes.label}>Average monthly value</p>
      </div>
    </div>
  );
}
