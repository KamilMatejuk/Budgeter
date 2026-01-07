import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { z } from "zod";
import { CashWithId, PersonalAccountWithId, Transaction, TransactionWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import { post } from "@/app/api/fetch";
import { ERROR } from "@/const/message";
import TagsInputWithError from "@/components/form/TagsInputWithError";
import DropDownInputWithError from "@/components/form/DropDownInputWithError";
import DateInputWithError, { getISODateString, requiredDateInPast } from "@/components/form/DateInputWithError";
import AmountInputWithError, { requiredNonZeroAmount } from "@/components/form/AmountInputWithError";
import { useCashs, usePersonalAccounts } from "@/app/api/query";
import { getAccountName } from "@/components/table/cells/AccountNameUtils";
import { CURRENCY_SYMBOLS } from "@/types/enum";
import ChoiceInputWithError from "@/components/form/ChoiceInputWithError";

enum Source {
  ACCOUNT = "ACCOUNT",
  CASH = "CASH",
}

const FormSchema = z.object({
  cash: z.nativeEnum(Source, { required_error: ERROR.requiredError }),
  account: requiredText,
  title: requiredText,
  organisation: requiredText,
  value: requiredNonZeroAmount,
  tags: z.array(z.string()).min(1, ERROR.requiredError),
  date: requiredDateInPast,
});
type FormSchemaType = z.infer<typeof FormSchema>;


async function submit(values: FormSchemaType, url: string, accounts: PersonalAccountWithId[], cash: CashWithId[]): Promise<boolean> {
  const val = {
    ...values,
    hash: "",
    cash: values.cash == Source.CASH,
    date: getISODateString(values.date),
    currency: values.cash == Source.CASH
      ? cash.find(c => c._id === values.account)?.currency
      : accounts.find(acc => acc._id === values.account)?.currency,
  } as Transaction;
  const { error } = await post(url, val);
  if (!error) return true;
  alert(`Error: ${error.message}`);
  return false;
}


export default function CreateTransactionModal({ url, open, onClose }: BackendModalProps<TransactionWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: {
      cash: Source.ACCOUNT,
      account: "",
      title: "",
      organisation: "",
      value: 0.0,
      tags: [],
      date: new Date(),
    },
    onSubmit: async (values) => { if (await submit(values, url, accounts || [], cash || [])) onClose() },
    validate: withZodSchema(FormSchema),
  });

  const accounts = usePersonalAccounts();
  const accountRecord = accounts.reduce(
    (acc, curr) => ({ ...acc, [curr._id]: getAccountName(curr) }),
    {} as Record<string, string>
  );
  const cash = useCashs();
  const cashRecord = cash.reduce(
    (acc, curr) => ({ ...acc, [curr._id]: `${curr.name} ${CURRENCY_SYMBOLS[curr.currency]}` }),
    {} as Record<string, string>
  );

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Create Transaction">
      <ChoiceInputWithError
        formik={formik}
        formikName="cash"
        optionsEnum={Source}
        label="Source"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          formik.setFieldValue("cash", e.target.value, true);
          formik.setFieldValue("account", "", true); // reset account when source changes
        }}
      />
      {formik.values.cash === Source.CASH
        ? <DropDownInputWithError formik={formik} formikName="account" label="Cash" optionsEnum={cashRecord} />
        : <DropDownInputWithError formik={formik} formikName="account" label="Account" optionsEnum={accountRecord} />
      }
      <TextInputWithError formik={formik} formikName="title" label="Title" />
      <TextInputWithError formik={formik} formikName="organisation" label="Organisation" />
      <AmountInputWithError formik={formik} formikName="value" label="Value" allowNegative />
      <TagsInputWithError formik={formik} formikName="tags" label="Tags" />
      <DateInputWithError formik={formik} formikName="date" label="Date" />
    </Modal >
  );
}
