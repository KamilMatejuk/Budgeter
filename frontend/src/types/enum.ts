// Source from backend.ts
export enum Source {
  MILLENNIUM = "Millennium",
  REVOLUT = "Revolut",
  EDENRED = "Edenred",
}

// Capitalization from backend.ts
export enum Capitalization {
  ONCE = "Once",
  DAILY = "Daily",
  MONTHLY = "Monthly",
  YEARLY = "Yearly",
}

// Currency from backend.ts
export enum Currency {
  PLN = "PLN",
  USD = "USD",
  EUR = "EUR",
}

// AccountType from backend.ts
export enum AccountType {
  PERSONAL = "Osobiste",
  EXCHANGE = "Walutowe",
  LUNCH = "Lunchowe",
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.PLN]: "zł",
  [Currency.USD]: "$",
  [Currency.EUR]: "€",
};

// ChartRange from backend.ts
export enum ChartRange {
  "3M" = "3M",
  "1Y" = "1Y",
  "FULL" = "FULL",
}
export const DEFAULT_CHART_RANGE = ChartRange["3M"];