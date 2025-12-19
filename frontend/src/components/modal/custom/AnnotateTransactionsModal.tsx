import React, { useEffect, useState } from "react";
import Modal, { BackendModalProps } from "../Modal";
import { z } from "zod";
import { Transaction, TransactionPartial, TransactionWithId } from "@/types/backend";
import { FormikConfig, useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import { patch } from "@/app/api/fetch";
import { ERROR } from "@/const/message";
import TagsInputWithError from "@/components/form/TagsInputWithError";
import TransactionDetails from "./TransactionDetails";
import ButtonWithLoader from "@/components/button/ButtonWithLoader";


const FormSchema = z.object({
  title: requiredText,
  tags: z.array(z.string()).min(1, ERROR.requiredError)
});
type FormSchemaType = z.infer<typeof FormSchema>;


async function submit(values: FormSchemaType, item: Transaction, url: string) {
  const val = { _id: item._id, ...values } as TransactionPartial;
  const { error } = await patch(url, val);
  if (!error) return true;
  alert(`Error: ${error.message}`);
  return false;
}

interface AnnotateTransactionModalProps extends BackendModalProps<TransactionWithId> {
  onSuccessfulSave: () => Promise<void>;
  onCancel: () => Promise<void>;
  item: TransactionWithId;
  counter: number;
  total: number;
}

export default function AnnotateTransactionsModal({
  url,
  item,
  open,
  onClose,
  onSuccessfulSave,
  onCancel,
  counter,
  total
}: AnnotateTransactionModalProps) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { title: item.title, tags: item.tags },
    onSubmit: async (values) => { if (await submit(values, item, url)) onSuccessfulSave() },
    validate: withZodSchema(FormSchema),
  });

  return (
    <Modal open={open} onClose={onClose} cancellable onCancel={onCancel} onSave={formik.submitForm} title="Annotate Transaction">
      <div className="absolute top-2 right-3">{counter} / {total}</div>
      <TransactionDetails item={item!} />
      <TextInputWithError formik={formik} formikName="title" label="Title" />
      <TagsInputWithError formik={formik} formikName="tags" label="Tags" />
    </Modal >
  );
}
