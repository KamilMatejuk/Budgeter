import Modal, { BackendModalProps } from "../Modal";
import { z } from "zod";
import { Transaction, TransactionRepayRequest, TransactionWithId } from "@/types/backend";
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


async function submit(values: FormSchemaType, item: Transaction) {
  const backupName = `Before repay of "${values.debt.toLowerCase()}"`;
  if (!await backupStateBeforeUpdate(backupName)) return false;
  const val = { _id: item._id, debt_transaction_id: values.debt } as TransactionRepayRequest;
  const { error } = await post("/api/transaction/repay", val);
  if (!error) return true;
  alert(`Error: ${error.message}`);
  return false;
}


export default function RepayTransactionModal({ url, item, open, onClose }: BackendModalProps<TransactionWithId>) {
  const people = usePeopleWithDebt();

  const formik = useFormik<FormSchemaType>({
    initialValues: { debt: "" },
    onSubmit: async (values) => { if (item && await submit(values, item)) onClose() },
    validate: withZodSchema(FormSchema),
  });

  return item && (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Mark transaction as repayment of debt">
      <TransactionDetails item={item} />
      <DropDownInputWithError formik={formik} formikName="debt" label="Debt" optionsEnum={people} />
    </Modal >
  );
}
