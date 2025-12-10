import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { submit } from "./utils";
import { z } from "zod";
import { ERROR } from "@/const/message";
import { StockAccountWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import { Currency } from "@/types/enum";
import AmountInputWithError, { requiredPositiveAmount } from "../../form/AmountInputWithError";
import ChoiceInputWithError from "../../form/ChoiceInputWithError";
import AccountNumberInputWithError, { requiredAccountNumber } from "../../form/AccountNumberInputWithError";


const FormSchema = z.object({
    name: requiredText,
    number: requiredAccountNumber,
    value: requiredPositiveAmount,
    currency: z.nativeEnum(Currency, { required_error: ERROR.requiredError }),
    yearly_interest: requiredPositiveAmount,
});
type FormSchemaType = z.infer<typeof FormSchema>;


export default function UpdateStockAccountModal({ url, item, open, onClose }: BackendModalProps<StockAccountWithId>) {
    const formik = useFormik<FormSchemaType>({
        initialValues: {
            name: item?.name || "",
            number: item?.number || "",
            value: item?.value || 0,
            currency: item?.currency as Currency || Currency.PLN,
            yearly_interest: item?.yearly_interest || 0,
        },
        onSubmit: async (values) => await submit<FormSchemaType, StockAccountWithId>(url, values, item?._id, onClose),
        validate: withZodSchema(FormSchema),
    });

    return (
        <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Stock Account">
            <TextInputWithError formik={formik} formikName="name" label="Name" />
            <AccountNumberInputWithError formik={formik} formikName="number" label="Number" />
            <AmountInputWithError formik={formik} formikName="value" label="Value" />
            <ChoiceInputWithError formik={formik} formikName="currency" optionsEnum={Currency} label="Currency" />
            <AmountInputWithError formik={formik} formikName="yearly_interest" label="Yearly Interest" />
        </Modal>
    );
}
