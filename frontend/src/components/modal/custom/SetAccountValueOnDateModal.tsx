import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { z } from "zod";
import { BackupRequest, PatchAccountValueRequest, PersonalAccountWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import AmountInputWithError, { requiredNonNegativeAmount } from "../../form/AmountInputWithError";
import DateInputWithError, { getISODateString, requiredDateInPast } from "@/components/form/DateInputWithError";
import { patch, post } from "@/app/api/fetch";


const FormSchema = z.object({
  date: requiredDateInPast,
  value: requiredNonNegativeAmount,
});
type FormSchemaType = z.infer<typeof FormSchema>;


export default function SetAccountValueOnDateModal({ url, item, open, onClose }: BackendModalProps<PersonalAccountWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { date: new Date(), value: item?.value || 0 },
    onSubmit: async (values) => {
      const backupName = `Auto pre-value-edit of "${item?.name.toLowerCase()}"`;
      const { error: backupError } = await post(`/api/backup`, { name: backupName, auto: true } as BackupRequest);
      if (backupError) {
        alert(`Error: ${backupError.message}`);
        return;
      }
      const val: PatchAccountValueRequest = { _id: item?._id, date: getISODateString(values.date), value: values.value };
      const { error } = await patch("/api/history/account_value", val);
      if (error) alert(`Error: ${error.message}`);
      else return onClose();
    },
    validate: withZodSchema(FormSchema),
  });

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Set value on specific date">
      <DateInputWithError formik={formik} formikName="date" label="Date" />
      <AmountInputWithError formik={formik} formikName="value" label="Value" />
    </Modal>
  );
}
