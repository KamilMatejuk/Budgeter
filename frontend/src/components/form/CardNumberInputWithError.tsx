import React from "react";
import { z } from "zod";
import { ERROR } from "@/const/message";
import TextInputWithError, { getValue, TextInputWithErrorProps } from "./TextInputWithError";


export const requiredCardNumber = z.preprocess(
  (val) => (val as string).replace(/\s+/g, ''),
  z.string({ required_error: ERROR.requiredError })
    .refine((val) => val.length === 16 || val.length === 28, "Card number must be either 16 or 28 characters long")
);

function format(value: string) {
  // remove non-numeric characters except X
  value = value.toUpperCase().replace(/[^0-9A-Z]/g, "").trim();
  // insert space every 4 characters
  return value.replace(/(.{4})/g, "$1 ").trim();
}

export default function CardNumberInputWithError<T>({
  formik,
  formikName,
  label,
}: TextInputWithErrorProps<T>) {
  const value = getValue(formik, formikName);

  function set(newValue: string) {
    newValue = format(newValue);
    // maximum 28 charasters + spaces between
    if (value.length === (4 * 7 + 6) && newValue.length > value.length) return;
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
        const cursorPos = e.target.selectionStart || e.target.value.length;
        requestAnimationFrame(() => e.target.setSelectionRange(cursorPos, cursorPos));
      }}
      onBlur={() => set(value)}
    />
  );
}
