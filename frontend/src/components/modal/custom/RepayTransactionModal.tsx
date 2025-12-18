import Modal, { BackendModalProps } from "../Modal";
import { z } from "zod";
import { Transaction, TransactionRepayRequest, TransactionWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import { requiredText } from "../../form/TextInputWithError";
import { get, post } from "@/app/api/fetch";
import { FaArrowRight } from "react-icons/fa";
import CellAccountName from "../../table/cells/CellAccountName";
import CellOrganisation from "../../table/cells/CellOrganisation";
import CellValue, { formatValue } from "../../table/cells/CellValue";
import DropDownInputWithError from "@/components/form/DropDownInputWithError";
import { backupStateBeforeUpdate } from "../update/utils";
import { getDateString } from "@/const/date";
import { usePeopleWithDebt } from "@/app/api/query";


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
      <div className="flex justify-center"><CellValue value={item.value} currency={item.currency} colour /></div>
      <div className="flex justify-center">{getDateString(item.date)}</div>
      <div className="flex gap-3 items-center justify-center">
        <div className="m-auto"><CellAccountName id={item.account} /></div>
        <FaArrowRight className="" />
        <div className="m-auto"><CellOrganisation name={item.organisation} /></div>
      </div>
      <DropDownInputWithError formik={formik} formikName="debt" label="Debt" optionsEnum={people} />
    </Modal >
  );
}
