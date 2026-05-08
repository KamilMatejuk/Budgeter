import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { submit } from "./utils";
import { z } from "zod";
import { ERROR } from "@/const/message";
import { CashWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import { Currency } from "@/types/enum";
import AmountInputWithError, { requiredNonNegativeAmount } from "../../form/AmountInputWithError";
import ChoiceInputWithError from "../../form/ChoiceInputWithError";
import { Withdrawable } from "./UpdatePersonalAccountModal";


const FormSchema = z.object({
  name: requiredText,
  value: requiredNonNegativeAmount,
  currency: z.nativeEnum(Currency, { required_error: ERROR.requiredError }),
  withdrawable: z.nativeEnum(Withdrawable, { required_error: ERROR.requiredError }),
});
type FormSchemaType = z.infer<typeof FormSchema>;
type SubmitFormSchemaType = Omit<FormSchemaType, "withdrawable"> & { withdrawable: boolean };


export default function UpdateCashModal({ url, item, open, onClose }: BackendModalProps<CashWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: {
      name: item?.name || "",
      value: item?.value || 0,
      currency: item?.currency as Currency || Currency.PLN,
      withdrawable: item?.withdrawable ? Withdrawable.YES : Withdrawable.NO,
    },
    onSubmit: async (values) => {
      const val = { ...values, withdrawable: values.withdrawable == Withdrawable.YES }
      await submit<SubmitFormSchemaType, CashWithId>(url, val, item?._id, onClose)
    },
    validate: withZodSchema(FormSchema),
  });

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title={item ? "Update cash" : "Create cash"}>
      <TextInputWithError formik={formik} formikName="name" label="Name" />
      <AmountInputWithError formik={formik} formikName="value" label="Value" />
      <ChoiceInputWithError formik={formik} formikName="currency" options={Currency} label="Currency" />
      <ChoiceInputWithError formik={formik} formikName="withdrawable" options={Withdrawable} label="Withdrawable" />
    </Modal>
  );
}
