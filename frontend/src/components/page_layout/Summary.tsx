const classes = {
  container: "flex flex-row justify-evenly items-center gap-4 md:gap-8",
  item: "flex flex-col justify-center items-center",
  value: "text-lg md:text-2xl font-semibold text-center whitespace-nowrap",
  label: "text-xs md:text-sm text-subtext text-center",
}

interface SummaryProps {
  data: {value: number | string, label: string}[];
  labelPosition?: "top" | "bottom";
}

export default function Summary({ data, labelPosition = "bottom" }: SummaryProps) {
  return (
    <div className={classes.container}>
      {data.map((d, i) => (
        <div key={i} className={classes.item}>
          {labelPosition === "top" && <p className={classes.label}>{d.label}</p>}
          <p className={classes.value}>{d.value}</p>
          {labelPosition === "bottom" && <p className={classes.label}>{d.label}</p>}
        </div>
      ))}
    </div>
  );
}
