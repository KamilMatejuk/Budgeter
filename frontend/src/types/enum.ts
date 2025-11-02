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

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
    [Currency.PLN]: "zł",
    [Currency.USD]: "$",
    [Currency.EUR]: "€",
};
