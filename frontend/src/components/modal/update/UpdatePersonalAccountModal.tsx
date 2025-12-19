import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { submit } from "./utils";
import { z } from "zod";
import { ERROR } from "@/const/message";
import { PersonalAccountWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import { Currency } from "@/types/enum";
import AmountInputWithError, { requiredNonNegativeAmount } from "../../form/AmountInputWithError";
import ChoiceInputWithError from "../../form/ChoiceInputWithError";
import AccountNumberInputWithError, { requiredAccountNumber } from "../../form/AccountNumberInputWithError";


const FormSchema = z.object({
  icon: requiredText.regex(/^data:image\/.+/, { message: ERROR.imageBase64Format }),
  name: requiredText,
  number: requiredAccountNumber,
  value: requiredNonNegativeAmount,
  currency: z.nativeEnum(Currency, { required_error: ERROR.requiredError }),
  min_incoming_amount_monthly: requiredNonNegativeAmount,
  min_outgoing_amount_monthly: requiredNonNegativeAmount,
});
type FormSchemaType = z.infer<typeof FormSchema>;


export default function UpdatePersonalAccountModal({ url, item, open, onClose }: BackendModalProps<PersonalAccountWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: {
      icon: item?.icon || "",
      name: item?.name || "",
      number: item?.number || "",
      value: item?.value || 0,
      currency: item?.currency as Currency || Currency.PLN,
      min_incoming_amount_monthly: item?.min_incoming_amount_monthly || 0,
      min_outgoing_amount_monthly: item?.min_outgoing_amount_monthly || 0,
    },
    onSubmit: async (values) => await submit<FormSchemaType, PersonalAccountWithId>(url, values, item?._id, onClose),
    validate: withZodSchema(FormSchema),
  });

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title={item ? "Update personal account" : "Create personal account"}>
      <TextInputWithError formik={formik} formikName="icon" label="Icon" />
      <TextInputWithError formik={formik} formikName="name" label="Name" />
      <AccountNumberInputWithError formik={formik} formikName="number" label="Number" />
      <AmountInputWithError formik={formik} formikName="value" label="Value" />
      <ChoiceInputWithError formik={formik} formikName="currency" optionsEnum={Currency} label="Currency" />
      <AmountInputWithError formik={formik} formikName="min_incoming_amount_monthly" label="Minimal monthly incoming amount" />
      <AmountInputWithError formik={formik} formikName="min_outgoing_amount_monthly" label="Minimal monthly outgoing amount" />
    </Modal>
  );
}
