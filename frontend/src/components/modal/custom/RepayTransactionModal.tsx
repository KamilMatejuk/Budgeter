import Modal, { BackendModalProps } from "../Modal";
import { z } from "zod";
import { TransactionRichWithId, TransactionRepayRequest } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import { requiredText } from "../../form/TextInputWithError";
import { post } from "@/app/api/fetch";
import DropDownInputWithError from "@/components/form/DropDownInputWithError";
import { backupStateBeforeUpdate } from "../update/utils";
import { usePeopleWithDebt } from "@/app/api/query";
import TransactionDetails from "./TransactionDetails";


const FormSchema = z.object({ debt: requiredText });
type FormSchemaType = z.infer<typeof FormSchema>;


async function submit(values: FormSchemaType, item: TransactionRichWithId) {
  const backupName = `Before repay of "${values.debt.toLowerCase()}"`;
  if (!await backupStateBeforeUpdate(backupName)) return false;
  const val = { _id: item._id, debt_transaction_id: values.debt } as TransactionRepayRequest;
  const { error } = await post("/api/transaction/repay", val);
  if (error == null) return true;
  alert(`Error: ${error}`);
  return false;
}


export default function RepayTransactionModal({ url: _, item, open, onClose }: BackendModalProps<TransactionRichWithId>) {
  const people = usePeopleWithDebt();

  const formik = useFormik<FormSchemaType>({
    initialValues: { debt: "" },
    onSubmit: async (values) => { if (item && await submit(values, item)) onClose() },
    validate: withZodSchema(FormSchema),
  });

  return item && (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Mark transaction as repayment of debt" saveText="Repay">
      <TransactionDetails item={item} />
      <DropDownInputWithError formik={formik} formikName="debt" label="Debt" options={people} />
    </Modal >
  );
}
