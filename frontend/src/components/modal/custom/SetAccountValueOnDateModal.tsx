import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { z } from "zod";
import { PatchAccountValueRequest, PersonalAccountWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import AmountInputWithError, { requiredNonNegativeAmount } from "../../form/AmountInputWithError";
import DateInputWithError, { getISODateString, requiredDateInPast } from "@/components/form/DateInputWithError";
import { patch } from "@/app/api/fetch";
import { backupStateBeforeUpdate } from "../update/utils";
import { getAccountName } from "@/components/table/cells/AccountNameUtils";
import { usePersonalAccountManualUpdates } from "@/app/api/query";
import InfoToast from "@/components/toast/InfoToast";
import { getDateString } from "@/const/date";
import { CURRENCY_SYMBOLS } from "@/types/enum";


const FormSchema = z.object({
  date: requiredDateInPast,
  value: requiredNonNegativeAmount,
});
type FormSchemaType = z.infer<typeof FormSchema>;

async function submit(values: FormSchemaType, item?: PersonalAccountWithId | null) {
  const backupName = `Before value edit of "${item ? getAccountName(item) : "Unknown Account"}"`;
  if (!await backupStateBeforeUpdate(backupName)) return false;
  const val = { _id: item?._id, date: getISODateString(values.date), value: values.value } as PatchAccountValueRequest;
  const { error } = await patch("/api/history/account_value", val);
  if (!error) return true;
  alert(`Error: ${error.message}`);
  return false;
}

export default function SetAccountValueOnDateModal({ url, item, open, onClose }: BackendModalProps<PersonalAccountWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { date: new Date(), value: item?.value || 0 },
    onSubmit: async (values) => { if (await submit(values, item)) onClose() },
    validate: withZodSchema(FormSchema),
  });

  const updates = usePersonalAccountManualUpdates(item?._id || "")
    .map(update => `${getDateString(update.date)} to ${update.value} ${item ? CURRENCY_SYMBOLS[item.currency] : ""}`);

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Set value on specific date">
      {updates.length > 0 && <InfoToast message={
        `Latest updates:\n${updates.join("\n")}`} />}
      <DateInputWithError formik={formik} formikName="date" label="Date" />
      <AmountInputWithError formik={formik} formikName="value" label="Value" />
    </Modal>
  );
}
