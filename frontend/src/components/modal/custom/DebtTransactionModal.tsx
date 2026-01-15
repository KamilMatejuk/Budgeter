import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { z } from "zod";
import { Transaction, TransactionRichWithId, TransactionPartial } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import { patch } from "@/app/api/fetch";
import TransactionDetails from "./TransactionDetails";


const FormSchema = z.object({ person: requiredText });
type FormSchemaType = z.infer<typeof FormSchema>;


async function submit(values: FormSchemaType, item: Transaction, url: string) {
  const val = { _id: item._id, debt_person: values.person } as TransactionPartial;
  const { error } = await patch(url, val);
  if (!error) return true;
  alert(`Error: ${error.message}`);
  return false;
}


export default function DebtTransactionModal({ url, item, open, onClose }: BackendModalProps<TransactionRichWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { person: item?.debt_person || "" },
    onSubmit: async (values) => { if (item && await submit(values, item, url)) onClose() },
    validate: withZodSchema(FormSchema),
  });

  return item && (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Mark transaction as debt to be repaid">
      <TransactionDetails item={item} />
      <TextInputWithError formik={formik} formikName="person" label="Person" />
    </Modal >
  );
}
