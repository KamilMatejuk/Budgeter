import React from "react";
import Modal from "./Modal";
import { submit, UpdateModalProps } from "./UpdateModal";
import { z } from "zod";
import { ERROR } from "@/const/message";
import { MonthlyExpense, MonthlyExpenseWithId, MonthlyIncome, MonthlyIncomeWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../form/TextInputWithError";
import { Currency } from "@/types/enum";
import AmountInputWithError, { requiredPositiveAmount } from "../form/AmountInputWithError";
import ChoiceInputWithError from "../form/ChoiceInputWithError";
import DayOfMonthInputWithError, { requiredDayOfMonth } from "../form/DayOfMonthInputWithError";


const FormSchema = z.object({
    name: requiredText,
    value: requiredPositiveAmount,
    currency: z.nativeEnum(Currency, { required_error: ERROR.requiredError }),
    day_of_month: requiredDayOfMonth,
});
type FormSchemaType = z.infer<typeof FormSchema>;


export default function UpdateRecurringMonthlyModal({ url, item, open, onClose }: UpdateModalProps<MonthlyIncome | MonthlyExpense>) {
    const formik = useFormik<FormSchemaType>({
        initialValues: {
            name: item.name || "",
            value: item.value || 0,
            currency: item.currency as Currency || Currency.PLN,
            day_of_month: item.day_of_month || 1,
        },
        onSubmit: async (values) => { if (await submit<FormSchemaType, MonthlyIncomeWithId | MonthlyExpenseWithId>(url, values, item?._id)) onClose() },
        validate: withZodSchema(FormSchema),
    });

return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm}>
        <TextInputWithError formik={formik} formikName="name" label="Name" />
        <AmountInputWithError formik={formik} formikName="value" label="Value" />
        <ChoiceInputWithError formik={formik} formikName="currency" optionsEnum={Currency} label="Currency" />
        <DayOfMonthInputWithError formik={formik} formikName="day_of_month" label="Day of month (1-28)" />
    </Modal>
);
}
