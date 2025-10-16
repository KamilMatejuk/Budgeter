import React from "react";
import Modal from "./Modal";
import { submit, UpdateModalProps } from "./UpdateModal";
import { z } from "zod";
import { ERROR } from "@/const/message";
import { CapitalInvestment, CapitalInvestmentWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../form/TextInputWithError";
import { Capitalization, Currency } from "@/types/enum";
import AmountInputWithError, { requiredNonNegativeAmount, requiredPositiveAmount } from "../form/AmountInputWithError";
import ChoiceInputWithError from "../form/ChoiceInputWithError";
import { requiredDate } from "../form/DateInputWithError";
import DateRangeInputWithError from "../form/DateRangeInputWithError";


const FormSchema = z.object({
    name: requiredText,
    value: requiredNonNegativeAmount,
    currency: z.nativeEnum(Currency, { required_error: ERROR.requiredError }),
    yearly_interest: requiredPositiveAmount,
    capitalization: z.nativeEnum(Capitalization, { required_error: ERROR.requiredError }),
    start: requiredDate,
    end: requiredDate,
});
type FormSchemaType = z.infer<typeof FormSchema>;


export default function UpdateCapitalInvestmentModal({ url, item, open, onClose }: UpdateModalProps<CapitalInvestment>) {
    const formik = useFormik<FormSchemaType>({
        initialValues: {
            name: item.name || "",
            value: item.value || 0,
            currency: item.currency as Currency || Currency.PLN,
            yearly_interest: item.yearly_interest || 0,
            capitalization: item.capitalization as Capitalization || Capitalization.ONCE,
            start: item.start ? new Date(item.start) : new Date(),
            end: item.end ? new Date(item.end) : new Date(),
        },
        onSubmit: async (values) => { if (await submit<FormSchemaType, CapitalInvestmentWithId>(url, values, item?._id)) onClose() },
        validate: withZodSchema(FormSchema),
    });

return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm}>
        <TextInputWithError formik={formik} formikName="name" label="Name" />
        <AmountInputWithError formik={formik} formikName="value" label="Value" />
        <ChoiceInputWithError formik={formik} formikName="currency" optionsEnum={Currency} label="Currency" />
        <AmountInputWithError formik={formik} formikName="yearly_interest" label="Yearly Interest" />
        <ChoiceInputWithError formik={formik} formikName="capitalization" optionsEnum={Capitalization} label="Capitalization" />
        <DateRangeInputWithError formik={formik} formikNames={["start", "end"]} label="Date Range" />
    </Modal>
);
}
