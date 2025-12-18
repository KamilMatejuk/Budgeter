import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { z } from "zod";
import { Transaction, TransactionPartial, TransactionWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import { patch } from "@/app/api/fetch";
import { FaArrowRight } from "react-icons/fa";
import CellAccountName from "../../table/cells/CellAccountName";
import CellOrganisation from "../../table/cells/CellOrganisation";
import CellValue from "../../table/cells/CellValue";
import { getDateString } from "@/const/date";


const FormSchema = z.object({ person: requiredText });
type FormSchemaType = z.infer<typeof FormSchema>;


async function submit(values: FormSchemaType, item: Transaction, url: string) {
  const val = { _id: item._id, debt_person: values.person } as TransactionPartial;
  const { error } = await patch(url, val);
  if (!error) return true;
  alert(`Error: ${error.message}`);
  return false;
}


export default function DebtTransactionModal({ url, item, open, onClose }: BackendModalProps<TransactionWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { person: item?.debt_person || "" },
    onSubmit: async (values) => { if (item && await submit(values, item, url)) onClose() },
    validate: withZodSchema(FormSchema),
  });

  return item && (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Mark transaction as debt to be repaid">
      <div className="flex justify-center"><CellValue value={item.value} currency={item.currency} colour /></div>
      <div className="flex justify-center">{getDateString(item.date)}</div>
      <div className="flex justify-center">{item.title}</div>
      <div className="flex gap-3 items-center justify-center">
        <div className="m-auto"><CellAccountName id={item.account} /></div>
        <FaArrowRight className="" />
        <div className="m-auto"><CellOrganisation name={item.organisation} /></div>
      </div>
      <TextInputWithError formik={formik} formikName="person" label="Person" />
    </Modal >
  );
}
