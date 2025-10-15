import React from "react";
import Modal from "./Modal";
import { submit, UpdateModalProps } from "./UpdateModal";
import { z } from "zod";
import { ERROR } from "@/const/message";
import { Card, CardWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../form/TextInputWithError";
import { Currency } from "@/types/enum";
import AmountInputWithError, { requiredNonNegativeAmount } from "../form/AmountInputWithError";
import ChoiceInputWithError from "../form/ChoiceInputWithError";
import CardNumberInputWithError, { requiredCardNumber } from "../form/CardNumberInputWithError";

enum Type {
    DEBIT = "DEBIT",
    CREDIT = "CREDIT",
}

const FormSchema = z.object({
    name: requiredText,
    number: requiredCardNumber,
    value: requiredNonNegativeAmount,
    currency: z.nativeEnum(Currency, { required_error: ERROR.requiredError }),
    credit: z.nativeEnum(Type, { required_error: ERROR.requiredError }),
});
type FormSchemaType = z.infer<typeof FormSchema>;
type SubmitFormSchemaType = Omit<FormSchemaType, "credit"> & { credit: boolean };



export default function UpdateCardModal({ url, item, open, onClose }: UpdateModalProps<Card>) {
    const formik = useFormik<FormSchemaType>({
        initialValues: {
            name: item.name || "",
            value: item.value || 0,
            currency: item.currency as Currency || Currency.PLN,
            number: item.number || "",
            credit: item.credit ? Type.CREDIT : Type.DEBIT,
        },
        onSubmit: async (values) => {
            if (await submit<SubmitFormSchemaType, CardWithId>(url, {...values, credit: values.credit == Type.CREDIT}, item?._id)) {
                onClose();
            }
        },
        validate: withZodSchema(FormSchema),
    });

    return (
        <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm}>
            <TextInputWithError formik={formik} formikName="name" label="Name" />
            <CardNumberInputWithError formik={formik} formikName="number" label="Number" />
            <AmountInputWithError formik={formik} formikName="value" label="Value" />
            <ChoiceInputWithError formik={formik} formikName="currency" optionsEnum={Currency} label="Currency" />
            <ChoiceInputWithError formik={formik} formikName="credit" optionsEnum={Type} label="Type" />
        </Modal>
    );
}
