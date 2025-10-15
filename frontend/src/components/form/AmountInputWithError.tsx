import React from "react";
import { z } from "zod";
import { ERROR } from "@/const/message";
import TextInputWithError, { getValue, TextInputWithErrorProps } from "./TextInputWithError";


export const requiredAmount = z.preprocess(
  (val) => preprocess(val as string),
  z.number({ required_error: ERROR.requiredError })
    .finite({ message: ERROR.positiveError })
    .gt(0, { message: ERROR.positiveError })
    .transform((n) => Number(n.toFixed(2)))
);


function preprocess(value: number | string) {
  if (typeof value !== "string") return value;
  if (value === "") return undefined;
  return Number(value);
}


function removeChars(value: number | string | undefined) {
  if (typeof value !== "string") return value ? value.toString() : "";
  value = value.replace(",", ".").replace(/[^0-9\.]/g, "").trim();
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
  return "0.00";
}


export default function AmountInputWithError<T>({
  formik,
  formikName,
  label,
}: TextInputWithErrorProps<T>) {
  const value = getValue(formik, formikName);

  return (
    <TextInputWithError
      formik={formik}
      formikName={formikName}
      label={label}
      inputMode="decimal"
      value={value}
      onChange={(e) => {
        const cleaned = removeChars(e.target.value);
        formik.setFieldValue(formikName as string, cleaned);
      }}
      onFocus={() => formik.setFieldValue(formikName as string, "")}
      onBlur={() => formik.setFieldValue(formikName as string, format(value))}
    />
  );
}
