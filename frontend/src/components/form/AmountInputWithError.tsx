import React from "react";
import { z } from "zod";
import { ERROR } from "@/const/message";
import TextInputWithError, { TextInputWithErrorProps } from "./TextInputWithError";
import { getValue } from "./InputWithError";


export const requiredPositiveAmount = z.preprocess(
  (val) => preprocess(val as string),
  z.number({ required_error: ERROR.requiredError })
    .finite({ message: ERROR.positiveError })
    .gt(0, { message: ERROR.positiveError })
    .transform((n) => Number(n.toFixed(2)))
);

export const requiredNonNegativeAmount = z.preprocess(
  (val) => preprocess(val as string),
  z.number({ required_error: ERROR.requiredError })
    .finite({ message: ERROR.positiveError })
    .gte(0, { message: ERROR.nonNegativeError })
    .transform((n) => Number(n.toFixed(2)))
);

export const requiredNonZeroAmount = z.preprocess(
  (val) => preprocess(val as string),
  z.number({ required_error: ERROR.requiredError })
    .finite({ message: ERROR.positiveError })
    .refine((n) => n !== 0, { message: ERROR.nonZeroError })
    .transform((n) => Number(n.toFixed(2)))
);

export const requiredAmount = z.preprocess(
  (val) => preprocess(val as string),
  z.number({ required_error: ERROR.requiredError })
    .finite({ message: ERROR.positiveError })
    .transform((n) => Number(n.toFixed(2)))
);


function preprocess(value: number | string) {
  if (typeof value !== "string") return value;
  if (value === "") return undefined;
  return Number(value);
}


function removeChars(value: number | string | undefined, allowNegative?: boolean) {
  if (typeof value !== "string") return value ? value.toString() : "";
  const forbidden = allowNegative ? /[^0-9-\.]/g : /[^0-9\.]/g;
  value = value.replace(",", ".").replace(forbidden, "").trim();
  // allow only one dot and 2 decimal places
  const dotIndex = value.indexOf(".");
  if (dotIndex === -1) return value;
  const before = value.slice(0, dotIndex);
  const after = value.slice(dotIndex + 1).replace(/\./g, "").slice(0, 2);
  return before + "." + after;
}


function format(value: number | string | undefined) {
  if (typeof value === "number") return value.toFixed(2);
  if (typeof value === "string" && value !== "") return Number(value).toFixed(2);
  return "";
}

export interface AmountInputWithErrorProps<T> extends TextInputWithErrorProps<T> {
  allowNegative?: boolean;
}

export default function AmountInputWithError<T>({
  formik,
  formikName,
  label,
  allowNegative,
}: AmountInputWithErrorProps<T>) {
  const value = format(getValue(formik, formikName));

  return (
    <TextInputWithError
      formik={formik}
      formikName={formikName}
      label={label}
      inputMode="decimal"
      value={value}
      onChange={(e) => {
        const cursorPos = (e.target.selectionStart || e.target.value.length);
        formik.setFieldValue(formikName as string, format(removeChars(e.target.value, allowNegative)));
        requestAnimationFrame(() => e.target.setSelectionRange(cursorPos, cursorPos));
      }}
      onBlur={() => formik.setFieldValue(formikName as string, format(value) || "0.00")}
    />
  );
}
