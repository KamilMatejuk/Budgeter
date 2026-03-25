import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { submit } from "./utils";
import { z } from "zod";
import { ERROR } from "@/const/message";
import { PersonalAccountWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import { AccountType, Currency, Source } from "@/types/enum";
import AmountInputWithError, { requiredNonNegativeAmount } from "../../form/AmountInputWithError";
import ChoiceInputWithError from "../../form/ChoiceInputWithError";
import AccountNumberInputWithError, { requiredAccountNumber } from "../../form/AccountNumberInputWithError";

export enum Withdrawable {
  YES = "AVAILABLE",
  NO = "BLOCKED",
}

const FormSchema = z.object({
  owner: requiredText,
  type: z.nativeEnum(AccountType, { required_error: ERROR.requiredError }),
  bank: z.nativeEnum(Source, { required_error: ERROR.requiredError }),
  number: requiredAccountNumber,
  value: requiredNonNegativeAmount,
  currency: z.nativeEnum(Currency, { required_error: ERROR.requiredError }),
  withdrawable: z.nativeEnum(Withdrawable, { required_error: ERROR.requiredError }),
  min_incoming_amount_monthly: requiredNonNegativeAmount,
  min_outgoing_amount_monthly: requiredNonNegativeAmount,
});
type FormSchemaType = z.infer<typeof FormSchema>;
type SubmitFormSchemaType = Omit<FormSchemaType, "withdrawable"> & { withdrawable: boolean };


export default function UpdatePersonalAccountModal({ url, item, open, onClose }: BackendModalProps<PersonalAccountWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: {
      owner: item?.owner || "",
      type: item?.type as AccountType || AccountType.PERSONAL,
      bank: item?.bank as Source || Source.MILLENNIUM,
      number: item?.number || "",
      value: item?.value || 0,
      currency: item?.currency as Currency || Currency.PLN,
      withdrawable: item?.withdrawable ? Withdrawable.YES : Withdrawable.NO,
      min_incoming_amount_monthly: item?.min_incoming_amount_monthly || 0,
      min_outgoing_amount_monthly: item?.min_outgoing_amount_monthly || 0,
    },
    onSubmit: async (values) => {
      const val = { ...values, withdrawable: values.withdrawable == Withdrawable.YES }
      await submit<SubmitFormSchemaType, PersonalAccountWithId>(url, val, item?._id, onClose);
    },
    validate: withZodSchema(FormSchema),
  });

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title={item ? "Update personal account" : "Create personal account"}>
      <TextInputWithError formik={formik} formikName="owner" label="Owner" />
      <ChoiceInputWithError formik={formik} formikName="type" options={AccountType} label="Type" />
      <ChoiceInputWithError formik={formik} formikName="bank" options={Source} label="Bank" />
      <AccountNumberInputWithError formik={formik} formikName="number" label="Number" />
      {!item && <AmountInputWithError formik={formik} formikName="value" label="Value" />}
      <ChoiceInputWithError formik={formik} formikName="currency" options={Currency} label="Currency" />
      <ChoiceInputWithError formik={formik} formikName="withdrawable" options={Withdrawable} label="Withdrawable" />
      <AmountInputWithError formik={formik} formikName="min_incoming_amount_monthly" label="Minimal monthly incoming amount" />
      <AmountInputWithError formik={formik} formikName="min_outgoing_amount_monthly" label="Minimal monthly outgoing amount" />
    </Modal>
  );
}
