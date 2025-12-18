import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { z } from "zod";
import { Transaction, TransactionSplitRequest, TransactionWithId } from "@/types/backend";
import { FormikProps, useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import AmountInputWithError, { requiredAmount, requiredNonZeroAmount } from "../../form/AmountInputWithError";
import { patch } from "@/app/api/fetch";
import { FaArrowRight } from "react-icons/fa";
import CellAccountName from "../../table/cells/CellAccountName";
import CellOrganisation from "../../table/cells/CellOrganisation";
import { ERROR } from "@/const/message";
import ButtonWithLoader from "../../button/ButtonWithLoader";
import CellValue from "../../table/cells/CellValue";
import { backupStateBeforeUpdate } from "../update/utils";
import { getDateString } from "@/const/date";


const createFormSchema = (totalValue: number) => z.object({
  parts: z
    .array(z.object({ title: requiredText, value: requiredNonZeroAmount }))
    .min(1, ERROR.requiredError)
    .superRefine((parts, ctx) => {
      const sum = parts.reduce((acc, curr) => acc + curr.value, 0);
      if (sum.toFixed(2) === totalValue.toFixed(2)) return;
      const message = `Total value should equal ${totalValue.toFixed(2)} and not ${sum.toFixed(2)}.`;
      parts.forEach((_, index) => ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [index, "value"] }));
    })
});
type FormSchemaType = z.infer<ReturnType<typeof createFormSchema>>;


function splitTransactionsIntoParts(formik: FormikProps<FormSchemaType>, title: string, n: number) {
  const currentParts = formik.values.parts.map(p => ({ ...p, value: requiredNonZeroAmount.parse(p.value) }));
  if (currentParts.length >= n) return;
  if (n <= 1) return;
  const totalValue = currentParts.reduce((sum, part) => sum + part.value, 0);
  const partValue = parseFloat((totalValue / n).toFixed(2));
  const remainder = parseFloat((totalValue - partValue * n).toFixed(2));
  const newParts = Array.from({ length: n }, (_, i) => ({
    title: `${title} #${i + 1}`,
    value: partValue + (i === n - 1 ? remainder : 0),
  }));
  formik.setFieldValue("parts", newParts);
}
function addTransactionPart(formik: FormikProps<FormSchemaType>, title: string) {
  const currentParts = formik.values.parts.map((p, i) => ({ ...p, title: `${title} #${i + 1}` }));
  const newPart = {
    title: `${title} #${currentParts.length + 1}`,
    value: 0,
  };
  formik.setFieldValue("parts", [...currentParts, newPart]);
}
function removeTransactionPart(formik: FormikProps<FormSchemaType>) {
  const currentParts = formik.values.parts.map(p => ({ ...p, value: requiredAmount.parse(p.value) }));
  if (currentParts.length <= 1) return;
  const lastPart = currentParts[currentParts.length - 1];
  const newParts = currentParts.slice(0, -1);
  newParts[currentParts.length - 2].value = parseFloat((newParts[currentParts.length - 2].value + lastPart.value).toFixed(2));
  formik.setFieldValue("parts", newParts);
}

async function submit(values: FormSchemaType, item: Transaction, url: string) {
  const backupName = `Before split of "${item?._id?.toLowerCase()}"`;
  if (!await backupStateBeforeUpdate(backupName)) return false;
  const val = { _id: item._id, items: values.parts } as TransactionSplitRequest;
  const { error } = await patch(`${url}/split`, val);
  if (!error) return true;
  alert(`Error: ${error.message}`);
  return false;
}


export default function SplitTransactionModal({ url, item, open, onClose }: BackendModalProps<TransactionWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { parts: [{ title: item?.title || "", value: item?.value || 0 }] },
    onSubmit: async (values) => { if (item && await submit(values, item, url)) onClose() },
    validate: withZodSchema(createFormSchema(item?.value || 0)),
  });

  return item && (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Split transaction">
      <div className="flex justify-center"><CellValue value={item.value} colour /></div>
      <div className="flex justify-center">{getDateString(item.date)}</div>
      <div className="flex gap-3 items-center justify-center">
        <div className="m-auto"><CellAccountName id={item.account} /></div>
        <FaArrowRight className="" />
        <div className="m-auto"><CellOrganisation name={item.organisation} /></div>
      </div>
      {/* split buttons */}
      <div className="w-full flex gap-1">
        <ButtonWithLoader
          className="flex-1 text-nowrap"
          action="neutral"
          disabled={formik.values.parts.length <= 1}
          onClick={async () => removeTransactionPart(formik)}
          text="-" />
        {[2, 3, 4, 5].flatMap(n => (
          <ButtonWithLoader
            key={n}
            className="flex-1 text-nowrap"
            action="neutral"
            disabled={formik.values.parts.length >= n}
            onClick={async () => splitTransactionsIntoParts(formik, item?.title || "", n)}
            text={`${n}`} />
        ))}
        <ButtonWithLoader
          className="flex-1 text-nowrap"
          action="neutral"
          onClick={async () => addTransactionPart(formik, item?.title || "")}
          text="+" />
      </div>
      {/* values */}
      {formik.values.parts.map((_, i) => (
        <div className="flex gap-1" key={i}>
          <div className="flex-2">
            <TextInputWithError
              formik={formik}
              formikName={`parts[${i}].title`}
              label={`Title #${i + 1}`} />
          </div>
          <div className="flex-1">
            <AmountInputWithError
              allowNegative
              formik={formik}
              formikName={`parts[${i}].value`}
              label={`Value #${i + 1}`} />
          </div>
        </div>
      ))}
    </Modal>
  );
}
