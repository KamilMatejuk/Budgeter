import React from "react";
import Modal from "./Modal";
import { submit, UpdateModalProps } from "./UpdateModal";
import { z } from "zod";
import { ERROR } from "@/const/message";
import { Cash, CashWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../form/TextInputWithError";
import { Currency } from "@/types/enum";
import AmountInputWithError, { requiredAmount } from "../form/AmountInputWithError";
import ChoiceInputWithError from "../form/ChoiceInputWithError";


const FormSchema = z.object({
    name: requiredText,
    value: requiredAmount,
    currency: z.nativeEnum(Currency, { required_error: ERROR.requiredError })
});
type FormSchemaType = z.infer<typeof FormSchema>;


export default function UpdateCashModal({ url, item, open, onClose }: UpdateModalProps<Cash>) {
    const formik = useFormik<FormSchemaType>({
        initialValues: {
            name: item.name || "",
            value: item.value || 0,
            currency: item.currency as Currency || Currency.PLN,
        },
        onSubmit: async (values) => { if (await submit<FormSchemaType, CashWithId>(url, values, item?._id)) onClose(); },
        validate: withZodSchema(FormSchema),
    });

    return (
        <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm}>
            <p>Name</p>
            <TextInputWithError formik={formik} formikName="name" />
            <p>Value</p>
            <AmountInputWithError formik={formik} formikName="value" />
            <p>Currency</p>
            <ChoiceInputWithError formik={formik} formikName="currency" optionsEnum={Currency} />
        </Modal>
    );
}
