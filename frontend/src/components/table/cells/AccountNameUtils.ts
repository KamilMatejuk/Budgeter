import { Cash, PersonalAccount } from "@/types/backend";
import { AccountType, CURRENCY_SYMBOLS } from "@/types/enum";


export function getAccountName(account: PersonalAccount, bank: boolean = true) {
  return [
    bank ? (account.bank ? account.bank.slice(0, 1) : "") : null,
    `${account.owner}`,
    `${account.type.toLowerCase()}`,
    account.type == AccountType.EXCHANGE ? `${CURRENCY_SYMBOLS[account.currency]}` : null,
  ].join(" ");
}

export function getCashName(cash: Cash) {
  return `${cash.name} ${CURRENCY_SYMBOLS[cash.currency]}`;
}
