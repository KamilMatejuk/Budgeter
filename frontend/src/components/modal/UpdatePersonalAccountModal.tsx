import React from "react";
import Modal from "./Modal";
import { submit, UpdateModalProps } from "./UpdateModal";
import { z } from "zod";
import { ERROR } from "@/const/message";
import { PersonalAccount, PersonalAccountWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../form/TextInputWithError";
import { Currency } from "@/types/enum";
import AmountInputWithError, { requiredNonNegativeAmount } from "../form/AmountInputWithError";
import ChoiceInputWithError from "../form/ChoiceInputWithError";
import AccountNumberInputWithError, { requiredAccountNumber } from "../form/AccountNumberInputWithError";


const FormSchema = z.object({
    name: requiredText,
    number: requiredAccountNumber,
    value: requiredNonNegativeAmount,
    currency: z.nativeEnum(Currency, { required_error: ERROR.requiredError }),
});
type FormSchemaType = z.infer<typeof FormSchema>;


export default function UpdatePersonalAccountModal({ url, item, open, onClose }: UpdateModalProps<PersonalAccount>) {
    const formik = useFormik<FormSchemaType>({
        initialValues: {
            name: item.name || "",
            number: item.number || "",
            value: item.value || 0,
            currency: item.currency as Currency || Currency.PLN,
        },
        onSubmit: async (values) => { if (await submit<FormSchemaType, PersonalAccountWithId>(url, values, item?._id)) onClose() },
        validate: withZodSchema(FormSchema),
    });

return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Personal Account">
        <TextInputWithError formik={formik} formikName="name" label="Name" />
        <AccountNumberInputWithError formik={formik} formikName="number" label="Number" />
        <AmountInputWithError formik={formik} formikName="value" label="Value" />
        <ChoiceInputWithError formik={formik} formikName="currency" optionsEnum={Currency} label="Currency" />
    </Modal>
);
}
