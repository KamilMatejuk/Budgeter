import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { submit } from "./utils";
import { z } from "zod";
import { ERROR } from "@/const/message";
import { StockAccountWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import { Currency } from "@/types/enum";
import AmountInputWithError, { requiredPositiveAmount } from "../../form/AmountInputWithError";
import ChoiceInputWithError from "../../form/ChoiceInputWithError";
import AccountNumberInputWithError, { requiredAccountNumber } from "../../form/AccountNumberInputWithError";
import { Withdrawable } from "./UpdatePersonalAccountModal";


const FormSchema = z.object({
  name: requiredText,
  number: requiredAccountNumber,
  value: requiredPositiveAmount,
  currency: z.nativeEnum(Currency, { required_error: ERROR.requiredError }),
  withdrawable: z.nativeEnum(Withdrawable, { required_error: ERROR.requiredError }),
  yearly_interest: requiredPositiveAmount,
});
type FormSchemaType = z.infer<typeof FormSchema>;
type SubmitFormSchemaType = Omit<FormSchemaType, "withdrawable"> & { withdrawable: boolean };


export default function UpdateStockAccountModal({ url, item, open, onClose }: BackendModalProps<StockAccountWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: {
      name: item?.name || "",
      number: item?.number || "",
      value: item?.value || 0,
      currency: item?.currency as Currency || Currency.PLN,
      withdrawable: item?.withdrawable ? Withdrawable.YES : Withdrawable.NO,
      yearly_interest: item?.yearly_interest || 0,
    },
    onSubmit: async (values) => {
      const val = { ...values, withdrawable: values.withdrawable == Withdrawable.YES }
      await submit<SubmitFormSchemaType, StockAccountWithId>(url, val, item?._id, onClose);
    },
    validate: withZodSchema(FormSchema),
  });

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title={item ? "Update stock account" : "Create stock account"}>
      <TextInputWithError formik={formik} formikName="name" label="Name" />
      <AccountNumberInputWithError formik={formik} formikName="number" label="Number" />
      <AmountInputWithError formik={formik} formikName="value" label="Value" />
      <ChoiceInputWithError formik={formik} formikName="currency" options={Currency} label="Currency" />
      <ChoiceInputWithError formik={formik} formikName="withdrawable" options={Withdrawable} label="Withdrawable" />
      <AmountInputWithError formik={formik} formikName="yearly_interest" label="Yearly Interest" digits={1} />
    </Modal>
  );
}
