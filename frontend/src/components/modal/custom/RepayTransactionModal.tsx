import React, { useEffect } from "react";
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
import CellValue from "../../table/cells/CellValue";
import DropDownInputWithError from "@/components/form/DropDownInputWithError";


const FormSchema = z.object({ debt: requiredText });
type FormSchemaType = z.infer<typeof FormSchema>;


async function submit(values: FormSchemaType, item: Transaction) {
  const val = { _id: item._id, debt_transaction_id: values.debt } as TransactionRepayRequest;
  const { error } = await post("/api/transaction/repay", val);
  if (!error) return true;
  alert(`Error: ${error.message}`);
  return false;
}


export default function RepayTransactionModal({ url, item, open, onClose }: BackendModalProps<TransactionWithId>) {
  const [people, setPeople] = React.useState<Record<string, string>>({});

  const formik = useFormik<FormSchemaType>({
    initialValues: { debt: "" },
    onSubmit: async (values) => { if (item && await submit(values, item)) onClose() },
    validate: withZodSchema(FormSchema),
  });

  // don't use useQuery, because we cannot track revalidation here
  useEffect(() => {
    (async () => {
      const { response } = await get<TransactionWithId[]>(`/api/transactions/debt`, ["transaction", "debt"]);
      console.log("Received debt transactions:", (response || []).length);
      const people = (response || []).reduce(
        (acc, curr) => ({ ...acc, [curr._id]: `${curr.debt_person} (${Math.abs(curr.value).toFixed(2)} on ${new Date(curr.date).toLocaleDateString("pl-PL")})` }),
        {} as Record<string, string>
      );
      setPeople(people);
    })();
  }, []);

  return item && (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Mark transaction as repayment of debt">
      <div className="flex justify-center"><CellValue value={item.value} colour /></div>
      <div className="flex justify-center">{new Date(item.date).toLocaleDateString("pl-PL")}</div>
      <div className="flex gap-3 items-center justify-center">
        <div className="m-auto"><CellAccountName id={item.account} /></div>
        <FaArrowRight className="" />
        <div className="m-auto"><CellOrganisation name={item.organisation} /></div>
      </div>
      <DropDownInputWithError formik={formik} formikName="debt" label="Debt" optionsEnum={people} />
    </Modal >
  );
}
