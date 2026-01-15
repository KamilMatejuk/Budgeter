import React from "react";
import Modal, { GroupBackendModalProps } from "../Modal";
import { z } from "zod";
import { TransactionOrgWithId, TransactionPartial } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import { patch } from "@/app/api/fetch";
import { ERROR } from "@/const/message";
import TagsInputWithError from "@/components/form/TagsInputWithError";


const FormSchema = z.object({ tags: z.array(z.string()).min(1, ERROR.requiredError) });
type FormSchemaType = z.infer<typeof FormSchema>;


async function submit(values: FormSchemaType, items: TransactionOrgWithId[], url: string) {
  await Promise.all(items.map(async (item) => {
    const val = { _id: item._id, tags: [...item.tags, ...values.tags] } as TransactionPartial;
    const { error } = await patch(url, val);
    if (error) alert(`Error tagging ${item._id}: ${error.message}`);
  }));
}

export default function GroupTagTransactionModal({ url, items, open, onClose }: GroupBackendModalProps<TransactionOrgWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { tags: [] },
    onSubmit: async (values) => { await submit(values, items, url); onClose(); },
    validate: withZodSchema(FormSchema),
  });

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Tag Transaction">
      <TagsInputWithError formik={formik} formikName="tags" label="Tags" />
    </Modal >
  );
}
