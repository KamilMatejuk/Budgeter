import { Currency as CurrencyType } from "@/types/backend";
import { Currency as CurrencyEnum } from "@/types/enum";

const FALLBACK_RATES = {
  PLNPLN: 1,
  EUREUR: 1,
  USDUSD: 1,
  PLNUSD: 0.27,
  EURUSD: 1.18,
  PLNEUR: 0.24,
  USDEUR: 0.85,
  USDPLN: 3.70,
  EURPLN: 4.25,
}

export async function getExchangeRate(base: CurrencyType | CurrencyEnum, target: CurrencyType | CurrencyEnum): Promise<number> {
  if (base === target) return 1;
  // https://www.freeforexapi.com/
  // max 100 requests per month
  try {
    const apiKey = process.env.NEXT_PUBLIC_FOREX_API_KEY;
    const currencies = Object.values(CurrencyEnum).join(',');
    const url = `https://apilayer.net/api/live?access_key=${apiKey}&currencies=${currencies}&source=${target}&format=1`;
    // store in cache for 1 day
    const options = { next: { revalidate: 24 * 60 * 60, tags: [`forex_${target}`] } };
    const response = await fetch(url, options);
    const data = await response.json();
    if (data.error && data.error.code == 104) throw new Error("Forex API monthly request limit reached");
    if (!data.quotes) throw new Error(`Invalid response from forex API: ${JSON.stringify(data)}`);
    return (1 / data.quotes[`${target}${base}`]) || FALLBACK_RATES[`${base}${target}`];
  } catch (error) {
    console.warn("Error fetching exchange rate:", error);
    return FALLBACK_RATES[`${base}${target}`];
  }
}

export async function convertToPLN(value: number, base: CurrencyType): Promise<number> {
  return await getExchangeRate(base, CurrencyEnum.PLN) * value;
}
