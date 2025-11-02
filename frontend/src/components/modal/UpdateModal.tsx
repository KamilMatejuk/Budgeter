import React from "react";
import { ModalProps } from "./Modal";
import { Item, ItemID } from "../table/Table";
import { patch, post } from "@/app/api/fetch";
import { CapitalInvestment, Card, Cash, MonthlyExpense, MonthlyIncome, Organisation, PersonalAccount, SavingsAccount, StockAccount } from "@/types/backend";
import UpdateCashModal from "./UpdateCashModal";
import UpdateCardModal from "./UpdateCardModal";
import UpdatePersonalAccountModal from "./UpdatePersonalAccountModal";
import UpdateSavingsAccountModal from "./UpdateSavingsAccountModal";
import UpdateStockAccountModal from "./UpdateStockAccountModal";
import UpdateCapitalInvestmentModal from "./UpdateCapitalInvestmentModal";
import UpdateRecurringMonthlyModal from "./UpdateRecurringMonthlyModal";
import UpdateOrganisationModal from "./UpdateOrganisationModal";


export interface UpdateModalProps<T extends Item> extends ModalProps {
    url: string;
    item: T;
}

// to be used in specific update modals e.g. submit<FormSchemaType, CardWithId>(url, values, item?._id)
export async function submit<FST, TID extends ItemID>(url: string, values: FST, id?: string) {
    const method = id ? patch : post;
    const { error } = await method(url, { _id: id, ...values } as unknown as TID);
    if (!error) return true;
    alert(`Error: ${error.message}`);
    return false;
}

export default function UpdateModal<T extends Item>({ url, item, open, onClose }: UpdateModalProps<T>) {
    if (url === "/api/products/cash") return <UpdateCashModal open={open} onClose={onClose} item={item as unknown as Cash} url={url} />;
    if (url === "/api/products/card") return <UpdateCardModal open={open} onClose={onClose} item={item as unknown as Card} url={url} />;
    if (url === "/api/products/personal_account") return <UpdatePersonalAccountModal open={open} onClose={onClose} item={item as unknown as PersonalAccount} url={url} />;
    if (url === "/api/products/savings_account") return <UpdateSavingsAccountModal open={open} onClose={onClose} item={item as unknown as SavingsAccount} url={url} />;
    if (url === "/api/products/stock_account") return <UpdateStockAccountModal open={open} onClose={onClose} item={item as unknown as StockAccount} url={url} />;
    if (url === "/api/products/capital_investment") return <UpdateCapitalInvestmentModal open={open} onClose={onClose} item={item as unknown as CapitalInvestment} url={url} />;
    if (url === "/api/products/monthly_income") return <UpdateRecurringMonthlyModal open={open} onClose={onClose} item={item as unknown as MonthlyIncome} url={url} title="Monthly Income"/>;
    if (url === "/api/products/monthly_expense") return <UpdateRecurringMonthlyModal open={open} onClose={onClose} item={item as unknown as MonthlyExpense} url={url} title="Monthly Expense"/>;
    if (url === "/api/organisation") return <UpdateOrganisationModal open={open} onClose={onClose} item={item as unknown as Organisation} url={url} />;
}
