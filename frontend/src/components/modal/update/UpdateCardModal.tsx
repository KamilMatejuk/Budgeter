import Modal, { BackendModalProps } from "../Modal";
import { submit } from "./utils";
import { z } from "zod";
import { ERROR } from "@/const/message";
import { CardWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import { Currency } from "@/types/enum";
import AmountInputWithError, { requiredAmount, requiredNonNegativeAmount } from "../../form/AmountInputWithError";
import ChoiceInputWithError from "../../form/ChoiceInputWithError";
import CardNumberInputWithError, { requiredCardNumber } from "../../form/CardNumberInputWithError";
import DropDownInputWithError from "../../form/DropDownInputWithError";
import { usePersonalAccounts } from "@/app/api/query";

enum Type {
  DEBIT = "DEBIT",
  CREDIT = "CREDIT",
}

enum Active {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

const FormSchema = z.object({
  name: requiredText,
  number: requiredCardNumber,
  value: requiredAmount,
  currency: z.nativeEnum(Currency, { required_error: ERROR.requiredError }),
  credit: z.nativeEnum(Type, { required_error: ERROR.requiredError }),
  active: z.nativeEnum(Active, { required_error: ERROR.requiredError }),
  account: requiredText,
  min_number_of_transactions_monthly: requiredNonNegativeAmount,
});
type FormSchemaType = z.infer<typeof FormSchema>;
type SubmitFormSchemaType = Omit<FormSchemaType, "credit" | "active"> & { credit: boolean, active: boolean };



export default function UpdateCardModal({ url, item, open, onClose }: BackendModalProps<CardWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: {
      name: item?.name || "",
      currency: item?.currency as Currency || Currency.PLN,
      number: item?.number || "",
      value: item?.value || 0,
      credit: item?.credit ? Type.CREDIT : Type.DEBIT,
      active: item?.active ? Active.ACTIVE : Active.INACTIVE,
      account: item?.account || "",
      min_number_of_transactions_monthly: item?.min_number_of_transactions_monthly || 0,
    },
    onSubmit: async (values) => {
      const val = {
        ...values,
        credit: values.credit == Type.CREDIT,
        active: values.active == Active.ACTIVE,
        value: values.credit == Type.CREDIT ? values.value : 0,
      }
      await submit<SubmitFormSchemaType, CardWithId>(url, val, item?._id, onClose);
    },
    validate: withZodSchema(FormSchema),
  });
  const accounts = usePersonalAccounts();
  const accountRecord = (accounts || []).reduce(
    (acc, curr) => ({ ...acc, [curr._id]: `${curr.name} (${curr.currency})` }),
    {} as Record<string, string>
  );


  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title={item ? "Update card" : "Create card"}>
      <TextInputWithError formik={formik} formikName="name" label="Name" />
      <CardNumberInputWithError formik={formik} formikName="number" label="Number" />
      {formik.values.credit === Type.CREDIT &&
        <AmountInputWithError formik={formik} formikName="value" label="Value" />}
      <ChoiceInputWithError formik={formik} formikName="currency" optionsEnum={Currency} label="Currency" />
      <ChoiceInputWithError formik={formik} formikName="credit" optionsEnum={Type} label="Type" />
      <ChoiceInputWithError formik={formik} formikName="active" optionsEnum={Active} label="Active" />
      <DropDownInputWithError formik={formik} formikName="account" label="Account" optionsEnum={accountRecord} />
      <AmountInputWithError formik={formik} formikName="min_number_of_transactions_monthly" label="Minimal monthly transactions" />
    </Modal>
  );
}
