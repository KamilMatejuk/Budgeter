import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { z } from "zod";
import { Transaction, TransactionRichWithId, TransactionPartial } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import { patch } from "@/app/api/fetch";
import { ERROR } from "@/const/message";
import TagsInputWithError from "@/components/form/fields/TagsInputWithError";
import TransactionDetails from "../custom/TransactionDetails";


const FormSchema = z.object({
  title: requiredText,
  tags: z.array(z.string()).min(1, ERROR.requiredError)
});
type FormSchemaType = z.infer<typeof FormSchema>;


async function submit(values: FormSchemaType, item: TransactionRichWithId, url: string) {
  const val = { _id: item._id, ...values } as TransactionPartial;
  const { error } = await patch(url, val);
  if (error == null) return true;
  alert(`Error: ${error}`);
  return false;
}


export default function UpdateTransactionModal({ url, item, open, onClose }: BackendModalProps<TransactionRichWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { title: item?.title || "", tags: item?.tags.map(tag => tag._id) || [] },
    onSubmit: async (values) => { if (item && await submit(values, item, url)) onClose() },
    validate: withZodSchema(FormSchema),
  });

  return item && (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Update Transaction">
      <TransactionDetails item={item} />
      <TextInputWithError formik={formik} formikName="title" label="Title" />
      <TagsInputWithError formik={formik} formikName="tags" label="Tags" organisation={item.organisation} />
    </Modal >
  );
}
