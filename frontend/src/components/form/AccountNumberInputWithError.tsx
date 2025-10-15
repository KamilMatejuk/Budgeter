import React from "react";
import { z } from "zod";
import { ERROR } from "@/const/message";
import TextInputWithError, { getValue, TextInputWithErrorProps } from "./TextInputWithError";


export const requiredAccountNumber = z.preprocess(
  (val) => (val as string).replace(/\s+/g, ''),
  z.string({ required_error: ERROR.requiredError }).superRefine((val, ctx) => {
    if (val.startsWith("PL") && val.length !== 28)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Account number with PL must be 28 characters long" });
    if (!val.startsWith("PL") && val.length !== 26)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Account number without PL must be 26 characters long" });
  })
);

function format(value: string) {
  // remove non-numeric characters except PL
  value = value.toUpperCase().replace(/[^0-9PL]/g, "").trim();
  // insert space every 4 characters
  if (!value.startsWith("PL")) {
    return `PL${value}`.replace(/(.{4})/g, "$1 ").trim().slice(2);
  }
  return value.replace(/(.{4})/g, "$1 ").trim();
}

export default function AccountNumberInputWithError<T>({
  formik,
  formikName,
  label,
}: TextInputWithErrorProps<T>) {
  const value = getValue(formik, formikName);

  function set(newValue: string) {
    newValue = format(newValue);
    if (newValue.length > value.length) {
      // maximum length 26/28 characters + spaces between
      if (/^[0-9]/.test(newValue) && value.length === 26 + 6) return;
      if (!/^[0-9]/.test(newValue) && value.length === 28 + 6) return;
    }
    formik.setFieldValue(formikName as string, newValue);
  }

  return (
    <TextInputWithError
      formik={formik}
      formikName={formikName}
      label={label}
      inputMode="decimal"
      value={value}
      onChange={(e) => {
        set(e.target.value);
        // fix cursor position (don't move to the end)
        const cursorPos = (e.target.selectionStart || e.target.value.length) + 1;
        requestAnimationFrame(() => e.target.setSelectionRange(cursorPos, cursorPos));
      }}
      onBlur={() => set(value)}
    />
  );
}
