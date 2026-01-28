'use client';

import { PieChart, PredictionLineChart } from "@/components/dashboard/Chart";
import { _getMonthsSinceDate, getMonthsArray } from "@/const/date";
import { calculate } from "./utils";
import { z } from "zod";
import { withZodSchema } from "formik-validator-zod";
import { useFormik } from "formik";
import AmountInputWithError from "@/components/form/AmountInputWithError";
import TextInputWithError from "@/components/form/TextInputWithError";
import MultilineText from "@/components/MultilineText";
import ButtonWithLoader from "@/components/button/ButtonWithLoader";
import { useState } from "react";

const classes = {
  container: "flex gap-2",
  param: "font-semibold text-center",
  option: "font-semibold self-center",
  details: "text-sm text-subtext m-0 text-center",
  columns: "flex-1 grid grid-rows-[24px_42px_42px_42px_42px_42px_42px]", // 42px for inputs and multiline details, 24px for titles
  optionsColumn: "grid grid-rows-[42px_42px_42px] gap-[42px] pt-[66px]",
  allocationsColumn: "grid grid-rows-[24px_252px]",
};

interface PredictionProps {
  currentInvestmentValues: number[];
  freeMoneyValues: number[];
  monthlySavings: number;
  nMonths: number;
  capitalRatio: number;
  avgCapitalInterest: number;
  avgCapitalLength: number;
  nCapital: number;
  stockRatio: number;
  avgStockInterest: number;
  nStock: number;
  maxTime: number;
  realisticPrediction: number[];
}

const FormSchema = z.object({
  monthlySavings: z.string(),
  monthlySavingsOptimistic: z.number(),
  monthlySavingsPessimistic: z.number(),
  stockInterest: z.string(),
  stockInterestOptimistic: z.number(),
  stockInterestPessimistic: z.number(),
  capitalInterest: z.string(),
  capitalInterestOptimistic: z.number(),
  capitalInterestPessimistic: z.number(),
  capitalLength: z.string(),
  capitalLengthOptimistic: z.number(),
  capitalLengthPessimistic: z.number(),
});
type FormSchemaType = z.infer<typeof FormSchema>;


export default function Prediction({
  currentInvestmentValues,
  freeMoneyValues,
  monthlySavings,
  nMonths,
  capitalRatio,
  avgCapitalInterest,
  avgCapitalLength,
  nCapital,
  stockRatio,
  avgStockInterest,
  nStock,
  maxTime,
  realisticPrediction,
}: PredictionProps) {
  const [years, setYears] = useState(Math.round(maxTime / 12 / 2));
  const formik = useFormik<FormSchemaType>({
    initialValues: {
      monthlySavings: monthlySavings.toFixed(2),
      monthlySavingsOptimistic: monthlySavings * 1.2,
      monthlySavingsPessimistic: monthlySavings * 0.8,
      stockInterest: avgStockInterest.toFixed(2),
      stockInterestOptimistic: 10,
      stockInterestPessimistic: 3,
      capitalInterest: avgCapitalInterest.toFixed(2),
      capitalInterestOptimistic: 6,
      capitalInterestPessimistic: 2,
      capitalLength: avgCapitalLength.toFixed(1),
      capitalLengthOptimistic: 6,
      capitalLengthPessimistic: 24,
    },
    onSubmit: async () => { },
    validate: withZodSchema(FormSchema),
  });

  const optimisticPrediction = calculate(
    currentInvestmentValues,
    freeMoneyValues,
    formik.values.monthlySavingsOptimistic,
    capitalRatio,
    formik.values.capitalInterestOptimistic,
    formik.values.capitalLengthOptimistic,
    stockRatio,
    formik.values.stockInterestOptimistic,
    maxTime);
  const pessimisticPrediction = calculate(
    currentInvestmentValues,
    freeMoneyValues,
    formik.values.monthlySavingsPessimistic,
    capitalRatio,
    formik.values.capitalInterestPessimistic,
    formik.values.capitalLengthPessimistic,
    stockRatio,
    formik.values.stockInterestPessimistic,
    maxTime);

  return (
    <>
      <p>
        The realistic prediction was calculated based on your current spending habits and investments.
        You can update optimistic and pessimistic scenarios by adjusting the parameters below.
      </p>
      {/* filters */}
      <div className={classes.container}>
        <div className={classes.optionsColumn}>
          <p className={classes.option}>Optimistic</p>
          <p className={classes.option}>Realistic</p>
          <p className={classes.option}>Pessimistic</p>
        </div>
        <div className={classes.columns}>
          <p className={classes.param}>Monthly Savings</p>
          <p className={classes.details}><MultilineText text={`saving 20% more\ngives ${(monthlySavings * 1.2).toFixed(2)} zł`} /></p>
          <AmountInputWithError formik={formik} formikName="monthlySavingsOptimistic" />
          <p className={classes.details}><MultilineText text={`current average\nfrom ${nMonths} months`} /></p>
          <TextInputWithError formik={formik} formikName="monthlySavings" disabled />
          <p className={classes.details}><MultilineText text={`saving 20% less\ngives ${(monthlySavings * 0.8).toFixed(2)} zł`} /></p>
          <AmountInputWithError formik={formik} formikName="monthlySavingsPessimistic" />
        </div>
        <div className={classes.columns}>
          <p className={classes.param}>Stock Interest</p>
          <p className={classes.details}><MultilineText text="S&P500 historically rallied\nwith good years over 10%" /></p>
          <AmountInputWithError formik={formik} formikName="stockInterestOptimistic" digits={1} />
          <p className={classes.details}><MultilineText text={`current average\nfrom ${nStock} stock investments`} /></p>
          <TextInputWithError formik={formik} formikName="stockInterest" disabled />
          <p className={classes.details}><MultilineText text="S&P500 can have few bad years\ndoesn't move at 0%" /></p>
          <AmountInputWithError formik={formik} formikName="stockInterestPessimistic" digits={1} allowNegative />
        </div>
        <div className={classes.columns}>
          <p className={classes.param}>Capital Interest</p>
          <p className={classes.details}><MultilineText text="interest rates are low\nand banks lend at 6%" /></p>
          <AmountInputWithError formik={formik} formikName="capitalInterestOptimistic" digits={1} />
          <p className={classes.details}><MultilineText text={`current average\nfrom ${nCapital} capital investments`} /></p>
          <TextInputWithError formik={formik} formikName="capitalInterest" disabled />
          <p className={classes.details}><MultilineText text="interest rates are high\nand banks lend at 2%" /></p>
          <AmountInputWithError formik={formik} formikName="capitalInterestPessimistic" digits={1} />
        </div>
        <div className={classes.columns}>
          <p className={classes.param}>Capital Length (months)</p>
          <p className={classes.details}><MultilineText text="quicker returns\nonly at bank for 6 months" /></p>
          <AmountInputWithError formik={formik} formikName="capitalLengthOptimistic" digits={0} />
          <p className={classes.details}><MultilineText text={`current average\nfrom ${nCapital} capital investments`} /></p>
          <TextInputWithError formik={formik} formikName="capitalLength" disabled />
          <p className={classes.details}><MultilineText text="money bound for longer\nbonds at 24 months" /></p>
          <AmountInputWithError formik={formik} formikName="capitalLengthPessimistic" digits={0} />
        </div>
        <div className={classes.allocationsColumn}>
          <p className={classes.param}>Money allocation</p>
          <PieChart
            width="252px" height="252px"
            labels={["Capital", "Stocks", "Uninvested"]}
            colors={["#22C55E", "#EF4444", "#000000"]}
            data={[
              Math.round(100 * capitalRatio),
              Math.round(100 * stockRatio),
              100 - Math.round(100 * capitalRatio) - Math.round(100 * stockRatio),
            ]} />
        </div>
      </div>
      {/* time */}
      <div className="flex gap-1 justify-center items-center mb-0">
        <p className={classes.details}>Years:</p>
        {Array(Math.round(maxTime / 12)).fill(0).map((_, i) => (
          <ButtonWithLoader
            key={i}
            text={(i + 1).toString()}
            action={i + 1 === years ? "positive" : "neutral"}
            className="px-2 py-0.5 rounded-md text-xs"
            onClick={async () => setYears(i + 1)}
          />
        ))}
      </div>
      {/* graph */}
      <PredictionLineChart
        top={optimisticPrediction.slice(0, 12 * years)}
        middle={realisticPrediction.slice(0, 12 * years)}
        bottom={pessimisticPrediction.slice(0, 12 * years)}
        labels={getMonthsArray(12 * years)}
        height="450px"
      />
    </>
  );
}
