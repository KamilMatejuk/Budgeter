export function invest(amount: number, interest: number, months: number): number[] {
  const values: number[] = [];
  let currentValue = amount;
  const monthlyRate = Math.pow(1 + interest / 100, 1 / 12) - 1; // Convert annual interest to monthly
  for (let month = 0; month <= months; month++) {
    values.push(currentValue);
    currentValue *= (1 + monthlyRate);
  }
  return values;
}

export function capital(amount: number, interest: number, length: number, months: number) {
  length = Math.round(length);
  if (months <= length)
    return { values: Array(months).fill(amount), freeMoney: Array(months).fill(0) };
  const totalRate = Math.pow(1 + interest / 100, length / 12);
  return {
    values: Array(length).fill(amount).concat(Array(months - length).fill(amount * totalRate)),
    freeMoney: Array(length).fill(0).concat([amount * totalRate]).concat(Array(months - length - 1).fill(0)),
  }
}

export function calculate(
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
