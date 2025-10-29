import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { submit, UpdateModalProps } from "./UpdateModal";
import { z } from "zod";
import { ERROR } from "@/const/message";
import { Card, CardWithId, PersonalAccountWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../form/TextInputWithError";
import { Currency } from "@/types/enum";
import AmountInputWithError, { requiredNonNegativeAmount } from "../form/AmountInputWithError";
import ChoiceInputWithError from "../form/ChoiceInputWithError";
import CardNumberInputWithError, { requiredCardNumber } from "../form/CardNumberInputWithError";
import DropDownInputWithError from "../form/DropDownInputWithError";
import { get } from "@/app/api/fetch";

enum Type {
    DEBIT = "DEBIT",
    CREDIT = "CREDIT",
}

const FormSchema = z.object({
    name: requiredText,
    number: requiredCardNumber,
    currency: z.nativeEnum(Currency, { required_error: ERROR.requiredError }),
    credit: z.nativeEnum(Type, { required_error: ERROR.requiredError }),
    account: requiredText,
    min_number_of_transactions_monthly: requiredNonNegativeAmount,
});
type FormSchemaType = z.infer<typeof FormSchema>;
type SubmitFormSchemaType = Omit<FormSchemaType, "credit"> & { credit: boolean };



export default function UpdateCardModal({ url, item, open, onClose }: UpdateModalProps<Card>) {
    const formik = useFormik<FormSchemaType>({
        initialValues: {
            name: item.name || "",
            currency: item.currency as Currency || Currency.PLN,
            number: item.number || "",
            credit: item.credit ? Type.CREDIT : Type.DEBIT,
            account: item.account || "",
            min_number_of_transactions_monthly: item.min_number_of_transactions_monthly || 0,
        },
        onSubmit: async (values) => {
            if (await submit<SubmitFormSchemaType, CardWithId>(url, { ...values, credit: values.credit == Type.CREDIT }, item?._id)) {
                onClose();
            }
        },
        validate: withZodSchema(FormSchema),
    });

    const [accounts, setAccounts] = useState<Record<string, string>>({});
    useEffect(() => {
        const fetchAccounts = async () => {
            const { response } = await get<PersonalAccountWithId[]>("/api/products/personal_account", ["personal_account"]);
            if (!response) return;
            const acc = response.reduce((acc, curr) => {
                acc[curr._id] = `${curr.name} (${curr.currency})`;
                return acc;
            }, {} as Record<string, string>);
            setAccounts(acc);
        };
        fetchAccounts();
    }, []);


    return (
        <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Card">
            <TextInputWithError formik={formik} formikName="name" label="Name" />
            <CardNumberInputWithError formik={formik} formikName="number" label="Number" />
            <ChoiceInputWithError formik={formik} formikName="currency" optionsEnum={Currency} label="Currency" />
            <ChoiceInputWithError formik={formik} formikName="credit" optionsEnum={Type} label="Type" />
            <DropDownInputWithError formik={formik} formikName="account" label="Account" optionsEnum={accounts} />
            <AmountInputWithError formik={formik} formikName="min_number_of_transactions_monthly" label="Minimal monthly transactions" />
        </Modal>
    );
}
