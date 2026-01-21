import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { z } from "zod";
import { PatchAccountValueRequest, PersonalAccountWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import AmountInputWithError, { requiredNonZeroAmount } from "../../form/AmountInputWithError";
import { patch } from "@/app/api/fetch";
import { backupStateBeforeUpdate } from "../update/utils";
import { getAccountName } from "@/components/table/cells/AccountNameUtils";


const FormSchema = z.object({ value: requiredNonZeroAmount });
type FormSchemaType = z.infer<typeof FormSchema>;

async function submit(values: FormSchemaType, item?: PersonalAccountWithId | null) {
  const backupName = `Before value edit of "${item ? getAccountName(item) : "Unknown Account"}"`;
  if (!await backupStateBeforeUpdate(backupName)) return false;
  const val = { _id: item?._id, value: values.value } as PatchAccountValueRequest;
  const { error } = await patch("/api/history/account_value", val);
  if (error == null) return true;
  alert(`Error: ${error}`);
  return false;
}

export default function SetAccountValueOnDateModal({ url, item, open, onClose }: BackendModalProps<PersonalAccountWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { value: 0 },
    onSubmit: async (values) => { if (await submit(values, item)) onClose() },
    validate: withZodSchema(FormSchema),
  });

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Change value on specific date" saveText="Change">
      <p className="text-sm text-subtext text-center">Set the change, that will be added to value on this day</p>
      <AmountInputWithError formik={formik} formikName="value" label="Change" allowNegative />
    </Modal>
  );
}
