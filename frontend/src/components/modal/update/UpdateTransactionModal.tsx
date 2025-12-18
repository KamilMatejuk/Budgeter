import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { z } from "zod";
import { Transaction, TransactionPartial, TransactionSplitRequest, TransactionWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import { patch } from "@/app/api/fetch";
import { FaArrowRight } from "react-icons/fa";
import CellAccountName from "../../table/cells/CellAccountName";
import CellOrganisation from "../../table/cells/CellOrganisation";
import { ERROR } from "@/const/message";
import CellValue from "../../table/cells/CellValue";
import TagsInputWithError from "@/components/form/TagsInputWithError";
import { getDateString } from "@/const/date";


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


export default function UpdateTransactionModal({ url, item, open, onClose }: BackendModalProps<TransactionWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { title: item?.title || "", tags: item?.tags || [] },
    onSubmit: async (values) => { if (item && await submit(values, item, url)) onClose() },
    validate: withZodSchema(FormSchema),
  });

  return item && (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Update Transaction">
      <div className="flex justify-center"><CellValue value={item.value} currency={item.currency} colour /></div>
      <div className="flex justify-center">{getDateString(item.date)}</div>
      <div className="flex gap-3 items-center justify-center">
        <div className="m-auto"><CellAccountName id={item.account} /></div>
        <FaArrowRight className="" />
        <div className="m-auto"><CellOrganisation name={item.organisation} /></div>
      </div>
      <TextInputWithError formik={formik} formikName={"title"} label="Title" />
      <TagsInputWithError formik={formik} formikName={"tags"} label={"Tags"} />
    </Modal >
  );
}
