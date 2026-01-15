import React from "react";
import { z } from "zod";
import { ERROR } from "@/const/message";
import TextInputWithError from "./TextInputWithError";
import { getValue, SingleInputWithErrorProps } from "./InputWithError";


export const requiredCardNumber = z.preprocess(
  (val) => (val as string).replace(/\s+/g, ''),
  z.string({ required_error: ERROR.requiredError })
    .refine((val) => val.length === 16, "Card number must be 16 characters long")
);

function format(value: string) {
  // remove non-numeric characters
  value = value.toUpperCase().replace(/[^0-9]/g, "").trim();
  // pad with X
  if (value.length > 4) value = value.slice(0, 4) + "XXXXXXXX" + value.slice(4);
  // insert space every 4 characters
  return value.replace(/(.{4})/g, "$1 ").trim();
}

export default function CardNumberInputWithError<T>({
  formik,
  formikName,
  label,
}: SingleInputWithErrorProps<T>) {
  const value = getValue(formik, formikName);

  function set(newValue: string) {
    newValue = format(newValue);
    // maximum 16 characters + spaces between
    if (newValue.length > value.length && value.length === 16 + 3) return;
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
        let cursorPos = e.target.selectionStart || e.target.value.length;
        if (cursorPos > 4 && cursorPos < 14) cursorPos += 11;
        requestAnimationFrame(() => e.target.setSelectionRange(cursorPos, cursorPos));
      }}
      onBlur={() => set(value)}
    />
  );
}
