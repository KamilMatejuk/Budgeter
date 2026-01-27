import ErrorToast from "../toast/ErrorToast";
import { ChartRange } from "@/types/enum";
import { getCapitalInvestments, getCash, getHistoricIncomeExpenseValues, getPersonalAccounts, getStockAccounts } from "@/app/api/getters";
import { PredictionLineChart } from "./Chart";
import { _getMonthsSinceDate, getMonthsArray, getMonthsBetweenDates } from "@/const/date";

const classes = {
  description: "text-sm text-subtext m-0",
};


function invest(amount: number, interest: number, months: number): number[] {
  const values: number[] = [];
  let currentValue = amount;
  const monthlyRate = Math.pow(1 + interest / 100, 1 / 12) - 1; // Convert annual interest to monthly
  for (let month = 0; month <= months; month++) {
    values.push(currentValue);
    currentValue *= (1 + monthlyRate);
  }
  return values;
}

function capital(amount: number, interest: number, length: number, months: number) {
  length = Math.round(length);
  if (months <= length)
    return { values: Array(months).fill(amount), freeMoney: Array(months).fill(0) };
  const totalRate = Math.pow(1 + interest / 100, length / 12);
  return {
    values: Array(length).fill(amount).concat(Array(months - length).fill(amount * totalRate)),
    freeMoney: Array(length).fill(0).concat([amount * totalRate]).concat(Array(months - length - 1).fill(0)),
  }
}

function calculate(
  currentInvestmentValues: number[],
  freeMoneyValues: number[],
  monthlySavings: number,
  capitalRatio: number,
  avgCapitalInterest: number,
  avgCapitalLength: number,
  stockRatio: number,
  avgStockInterest: number,
  months: number
): number[] {
  const values: number[] = [...currentInvestmentValues];
  const free: number[] = [...freeMoneyValues];
  // calculate how much each month is saved and invested
  for (let month = 0; month < months; month++) {
    const toCapital = monthlySavings * capitalRatio + free[month];
    const toStocks = monthlySavings * stockRatio;
    const toSaved = monthlySavings * (1 - capitalRatio - stockRatio);
    // save
    for (let m = month; m < months; m++) {
      values[m] += toSaved;
    }
    // stock
    const stockValues = invest(toStocks, avgStockInterest, months - month);
    for (let m = month; m < months; m++) {
      values[m] += stockValues[m - month];
    }
    // capital
    const { values: capitalValues, freeMoney: capitalfreeMoney } = capital(toCapital, avgCapitalInterest, avgCapitalLength, months - month);
    for (let m = month; m < months; m++) {
      values[m] += capitalValues[m - month] - free[month];
      free[m] += capitalfreeMoney[m - month];
    }
  }
  return values;
}


export default async function AccountsPrediction() {
  // 3 years
  const time = 12 * 3;

  // get average monthly savings
  const { response: monthlySavingsResponse, error: monthlySavingsError } = await getHistoricIncomeExpenseValues(ChartRange.FULL);
  if (monthlySavingsError != null)
    return <ErrorToast message={`Could not download accounts history: ${monthlySavingsError}`} />;
  const savings = Array(monthlySavingsResponse[0].length).fill(0).map((_, i) => monthlySavingsResponse[0][i] + monthlySavingsResponse[1][i]);
  if (savings.length <= 2)
    return <ErrorToast message={`Not enough data to calculate average savings`} />;
  const fullMonthSavings = savings.slice(1, savings.length - 1);
  const avgMonthlySavings = fullMonthSavings.reduce((a, b) => a + b, 0) / fullMonthSavings.length;

  // get capital investments and average interest and time
  const { response: capitalResponse, error: capitalError } = await getCapitalInvestments();
  if (capitalError != null)
    return <ErrorToast message={`Could not download capital investments: ${capitalError}`} />;
  const avgCapitalInterest = capitalResponse.reduce((acc, it) => acc + it.yearly_interest, 0) / capitalResponse.length;
  const avgCapitalLength = capitalResponse.reduce((acc, it) => acc + getMonthsBetweenDates(new Date(it.start), new Date(it.end)), 0) / capitalResponse.length;
  const currentCapitalValue = capitalResponse.reduce((acc, it) => acc + it.value_pln, 0);

  // get stock investments and average interest
  const { response: stockResponse, error: stockError } = await getStockAccounts();
  if (stockError != null)
    return <ErrorToast message={`Could not download stock investments: ${stockError}`} />;
  const avgStockInterest = stockResponse.reduce((acc, it) => acc + it.yearly_interest, 0) / stockResponse.length;
  const currentStockValue = stockResponse.reduce((acc, it) => acc + it.value_pln, 0);

  // get uninvested value
  const { response: accountsResponse, error: accountsError } = await getPersonalAccounts();
  if (accountsError != null)
    return <ErrorToast message={`Could not download personal accounts: ${accountsError}`} />;
  const { response: cashResponse, error: cashError } = await getCash();
  if (cashError != null)
    return <ErrorToast message={`Could not download cash accounts: ${cashError}`} />;
  const totalUninvested = (accountsResponse?.reduce((acc, it) => acc + it.value_pln, 0) || 0) +
    (cashResponse?.reduce((acc, it) => acc + it.value_pln, 0) || 0);

  // calculate current investment progression and free capital over time
  const uninvestedValues = Array(time).fill(totalUninvested)
  const stockValues = stockResponse.map(it => invest(it.value_pln, it.yearly_interest, time));
  const capitalValues = capitalResponse.map(it => {
    const passed = _getMonthsSinceDate(new Date(it.start)).length - 1;
    const length = getMonthsBetweenDates(new Date(it.start), new Date(it.end));
    const { values, freeMoney } = capital(it.value_pln, it.yearly_interest, length, time + passed);
    return { values: values.slice(passed), freeMoney: freeMoney.slice(passed) };
  });
  const currentInvestmentValues: number[] = [];
  const freeMoneyValues: number[] = [];
  for (let month = 0; month < time; month++) {
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

  // calculate
  const realisticPrediction = calculate(currentInvestmentValues, freeMoneyValues, avgMonthlySavings,
    capitalRatio, avgCapitalInterest, avgCapitalLength, stockRatio, avgStockInterest, time);
  const optimisticPrediction = calculate(currentInvestmentValues, freeMoneyValues, avgMonthlySavings * 1.2,
    capitalRatio, avgCapitalInterest, avgCapitalLength, stockRatio, avgStockInterest, time);
  const pessimisticPrediction = calculate(currentInvestmentValues, freeMoneyValues, avgMonthlySavings * 0.8,
    capitalRatio, avgCapitalInterest, avgCapitalLength, stockRatio, avgStockInterest, time);

  return (
    <>
      <p className={classes.description}>Based on below assumptions:</p>
      <p className={classes.description}>- average monthly savings: {avgMonthlySavings} zł
        (optimistic scenario of saving 20% more or {(avgMonthlySavings * 1.2).toFixed(2)} zł,
        pessimistic scenario of saving 20% less or {(avgMonthlySavings * 0.8).toFixed(2)} zł)</p>
      <p className={classes.description}>- {Math.round(100 * capitalRatio)}% of savings invested in capital
        with average return of {avgCapitalInterest.toFixed(1)}% annually over {avgCapitalLength.toFixed(1)} months</p>
      <p className={classes.description}>- {Math.round(100 * stockRatio)}% of savings invested in stocks
        with average return of {avgStockInterest.toFixed(1)}% annually</p>
      <p className={classes.description}>- {100 - Math.round(100 * capitalRatio) - Math.round(100 * stockRatio)}% of savings left uninvested</p>
      <PredictionLineChart
        top={optimisticPrediction}
        middle={realisticPrediction}
        bottom={pessimisticPrediction}
        labels={getMonthsArray(time)}
      />
    </>
  );
}
