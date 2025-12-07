import React from "react";
import Modal from "./Modal";
import { UpdateModalProps } from "./UpdateModal";
import { z } from "zod";
import { Transaction, TransactionPartial } from "@/types/backend";
import { FormikProps, useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../form/TextInputWithError";
import AmountInputWithError, { requiredAmount } from "../form/AmountInputWithError";
import { patch } from "@/app/api/fetch";
import { FaArrowRight } from "react-icons/fa";
import CellAccountName from "../table/CellAccountName";
import CellOrganisation from "../table/CellOrganisation";
import { ERROR } from "@/const/message";
import ButtonWithLoader from "../button/ButtonWithLoader";
import CellValue from "../table/CellValue";


const createFormSchema = (totalValue: number) => z.object({
    parts: z
        .array(z.object({ title: requiredText, value: requiredAmount }))
        .min(1, ERROR.requiredError)
        .superRefine((parts, ctx) => {
            const sum = parts.reduce((acc, curr) => acc + curr.value, 0);
            if (sum === totalValue) return;
            const message = `Total value should equal ${totalValue.toFixed(2)} and not ${sum.toFixed(2)}.`;
            parts.forEach((_, index) => ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [index, "value"] }));
        })
});
type FormSchemaType = z.infer<ReturnType<typeof createFormSchema>>;


function splitTransactionsIntoParts(formik: FormikProps<FormSchemaType>, n: number) {
    const currentParts = formik.values.parts.map(p => ({ ...p, value: requiredAmount.parse(p.value) }));
    if (currentParts.length >= n) return;
    if (n <= 1) return;
    const totalValue = currentParts.reduce((sum, part) => sum + part.value, 0);
    const partValue = parseFloat((totalValue / n).toFixed(2));
    const remainder = parseFloat((totalValue - partValue * n).toFixed(2));
    const title = currentParts[0]?.title || "";
    const newParts = Array.from({ length: n }, (_, i) => ({
        title: `${title} #${i + 1}`,
        value: partValue + (i === n - 1 ? remainder : 0)
    }));
    formik.setFieldValue("parts", newParts);
}
function addTransactionPart(formik: FormikProps<FormSchemaType>) {
    const currentParts = formik.values.parts;
    const title = currentParts[0]?.title || "";
    const newPart = {
        title: `${title} #${currentParts.length + 1}`,
        value: 0,
    };
    formik.setFieldValue("parts", [...currentParts, newPart]);
}
function removeTransactionPart(formik: FormikProps<FormSchemaType>) {
    const currentParts = formik.values.parts.map(p => ({ ...p, value: requiredAmount.parse(p.value) }));
    if (currentParts.length <= 1) return;
    const lastPart = currentParts[currentParts.length - 1];
    const newParts = currentParts.slice(0, -1);
    newParts[currentParts.length - 2].value = parseFloat((newParts[currentParts.length - 2].value + lastPart.value).toFixed(2));
    formik.setFieldValue("parts", newParts);
}

async function submit(values: FormSchemaType, item: Transaction, url: string) {
    const val = values.parts.length === 1
        ? { _id: item._id, ...values.parts[0] } as TransactionPartial // create regular transaction
        : values.parts.map(v => ({ _id: item._id, ...v } as TransactionPartial)); // split transaction
    if (Array.isArray(val)) {
        alert("Splitting transactions is not supported yet.");
        return false;
    }
    const { error } = await patch(url, val); // check _id or id
    console.log("UpdateTransactionModal submit", { val, error });
    if (!error) return true;
    alert(`Error: ${error.message}`);
    return false;
}


export default function UpdateTransactionModal({ url, item, open, onClose }: UpdateModalProps<Transaction>) {
    const formik = useFormik<FormSchemaType>({
        initialValues: { parts: [{ title: item.title, value: item.value }] },
        onSubmit: async (values) => {
            if (await submit(values, item, url)) onClose();
        },
        validate: withZodSchema(createFormSchema(item.value)),
    });
    const isSplit = formik.values.parts.length > 1;

    return (
        <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Transaction">
            <p className="m-auto">{new Date(item.date).toLocaleDateString("pl-PL")}</p>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-1 items-center">
                <div className="m-auto"><CellAccountName id={item.account} /></div>
                <FaArrowRight className="" />
                <div className="m-auto"><CellOrganisation name={item.organisation} /></div>
            </div>
            {isSplit &&
                <div className="w-full flex gap-1 justify-center">
                    <p>Total:</p>
                    <CellValue value={item.value} />
                </div>
            }
            {formik.values.parts.map((_, i) => (
                <div key={i}>
                    <TextInputWithError
                        formik={formik}
                        formikName={`parts[${i}].title`}
                        label={isSplit ? `Title #${i + 1}` : "Title"} />
                    <AmountInputWithError
                        allowNegative
                        formik={formik}
                        formikName={`parts[${i}].value`}
                        label={isSplit ? `Value #${i + 1}` : "Value"} />
                </div>
            ))}
            <p className="m-auto">Split into subtransactions</p>
            <div className="w-full flex gap-1">
                <ButtonWithLoader
                    className="text-nowrap"
                    action="neutral"
                    disabled={formik.values.parts.length >= 2}
                    onClick={async () => splitTransactionsIntoParts(formik, 2)}
                    text="Split to 2" />
                <ButtonWithLoader
                    className="text-nowrap"
                    action="neutral"
                    disabled={formik.values.parts.length >= 3}
                    onClick={async () => splitTransactionsIntoParts(formik, 3)}
                    text="Split to 3" />
                <ButtonWithLoader
                    className="text-nowrap"
                    action="neutral"
                    onClick={async () => addTransactionPart(formik)}
                    text="Add empty" />
                <ButtonWithLoader
                    className="text-nowrap"
                    action="neutral"
                    disabled={formik.values.parts.length <= 1}
                    onClick={async () => removeTransactionPart(formik)}
                    text="Remove" />
            </div>
        </Modal>
    );
}
