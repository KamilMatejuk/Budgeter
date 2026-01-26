const classes = {
  container: "flex flex-row justify-evenly items-center gap-8",
  item: "flex flex-col justify-center items-center",
  value: "text-2xl font-semibold",
  label: "text-sm text-subtext",
}

interface SummaryProps {
  data: {value: number | string, label: string}[];
}

export default function Summary({ data }: SummaryProps) {
  return (
    <div className={classes.container}>
      {data.map((d, i) => (
        <div key={i} className={classes.item}>
          <p className={classes.value}>{d.value}</p>
          <p className={classes.label}>{d.label}</p>
        </div>
      ))}
    </div>
  );
}
