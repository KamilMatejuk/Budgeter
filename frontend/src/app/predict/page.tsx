import ErrorToast from "@/components/toast/ErrorToast";
import PageHeader from "@/components/page_layout/PageHeader";
import { getCapitalInvestments, getCash, getHistoricIncomeExpenseValues, getPersonalAccounts, getStockAccounts } from "../api/getters";
import { ChartRange } from "@/types/enum";
import { _getMonthsSinceDate, getMonthsBetweenDates } from "@/const/date";
import Prediction from "./Prediction";
import { calculate, capital, invest } from "./utils";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Predict future value" };

const header = <PageHeader text="Accounts Prediction" subtext="Total accounts value in the future, given current trends" />

function error(message: string) {
  return (<>{header}<ErrorToast message={message} /></>);
}

function weightedAverage<T>(items: T[], value: keyof T, weight: keyof T): number {
  const totalWeight = items.reduce((acc, item) => acc + (item[weight] as number), 0);
  if (totalWeight === 0) return 0;
  return items.reduce((acc, item) => acc + (item[value] as number) * (item[weight] as number), 0) / totalWeight;
}

export default async function Predict() {
  // get average monthly savings
  const { response: monthlySavingsResponse, error: monthlySavingsError } = await getHistoricIncomeExpenseValues(ChartRange.FULL);
  if (monthlySavingsError != null)
    return error(`Could not download accounts history: ${monthlySavingsError}`);
  const savings = Array(monthlySavingsResponse[0].length).fill(0).map((_, i) => monthlySavingsResponse[0][i] + monthlySavingsResponse[1][i]);
  if (savings.length <= 2)
    return error(`Not enough data to calculate average savings`);
  const fullMonthSavings = savings.slice(1, savings.length - 1);
  const avgMonthlySavings = fullMonthSavings.reduce((a, b) => a + b, 0) / fullMonthSavings.length;

  // get capital investments and average interest and time
  const { response: capitalResponse, error: capitalError } = await getCapitalInvestments();
  if (capitalError != null)
    return error(`Could not download capital investments: ${capitalError}`);
  const avgCapitalInterest = weightedAverage(capitalResponse, "yearly_interest", "value_pln");
  const avgCapitalLength = capitalResponse.reduce((acc, it) => acc + getMonthsBetweenDates(new Date(it.start), new Date(it.end)), 0) / capitalResponse.length;
  const currentCapitalValue = capitalResponse.reduce((acc, it) => acc + it.value_pln, 0);

  // get stock investments and average interest
  const { response: stockResponse, error: stockError } = await getStockAccounts();
  if (stockError != null)
    return error(`Could not download stock investments: ${stockError}`);
  const avgStockInterest = weightedAverage(stockResponse, "yearly_interest", "value_pln");
  const currentStockValue = stockResponse.reduce((acc, it) => acc + it.value_pln, 0);

  // get uninvested value
  const { response: accountsResponse, error: accountsError } = await getPersonalAccounts();
  if (accountsError != null)
    return error(`Could not download personal accounts: ${accountsError}`);
  const { response: cashResponse, error: cashError } = await getCash();
  if (cashError != null)
    return error(`Could not download cash accounts: ${cashError}`);
  const totalUninvested = (accountsResponse?.reduce((acc, it) => acc + it.value_pln, 0) || 0) +
    (cashResponse?.reduce((acc, it) => acc + it.value_pln, 0) || 0);

  // calculate current investment progression and free capital over time
  const maxTime = 12 * 10; // 10 years
  const uninvestedValues = Array(maxTime).fill(totalUninvested)
  const stockValues = stockResponse.map(it => invest(it.value_pln, it.yearly_interest, maxTime));
  const capitalValues = capitalResponse.map(it => {
    const passed = _getMonthsSinceDate(new Date(it.start)).length - 1;
    const length = getMonthsBetweenDates(new Date(it.start), new Date(it.end));
    const { values, freeMoney } = capital(it.value_pln, it.yearly_interest, length, maxTime + passed);
    return { values: values.slice(passed), freeMoney: freeMoney.slice(passed) };
  });
  const currentInvestmentValues: number[] = [];
  const freeMoneyValues: number[] = [];
  for (let month = 0; month < maxTime; month++) {
    let total = 0;
    total += uninvestedValues[month];
    stockValues.forEach(sv => { total += sv[month]; });
    capitalValues.forEach(cv => { total += cv.values[month]; });
    currentInvestmentValues.push(total);
    freeMoneyValues.push(capitalValues.reduce((acc, cv) => acc + cv.freeMoney[month], 0));
  }

  // define monthly ratios
  const totalValue = totalUninvested + currentCapitalValue + currentStockValue;
  const capitalRatio = currentCapitalValue / totalValue;
  const stockRatio = currentStockValue / totalValue;

  // calc based on averages
  const realisticPrediction = calculate(currentInvestmentValues, freeMoneyValues, avgMonthlySavings,
    capitalRatio, avgCapitalInterest, avgCapitalLength, stockRatio, avgStockInterest, maxTime);

  return (
    <>
      {header}
      <Prediction
        currentInvestmentValues={currentInvestmentValues}
        freeMoneyValues={freeMoneyValues}
        monthlySavings={avgMonthlySavings}
        nMonths={fullMonthSavings.length}
        capitalRatio={capitalRatio}
        avgCapitalInterest={avgCapitalInterest}
        avgCapitalLength={avgCapitalLength}
        nCapital={capitalResponse.length}
        stockRatio={stockRatio}
        avgStockInterest={avgStockInterest}
        nStock={stockResponse.length}
        maxTime={maxTime}
        realisticPrediction={realisticPrediction}
      />
    </>
  )
}
