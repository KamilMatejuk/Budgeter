import React, { useMemo } from "react";
import { SingleInputWithErrorProps } from "../InputWithError";
import { useCashs } from "@/app/api/query";
import SearchableTextInputWithError from "../SearchableTextInputWithError";
import { CURRENCY_SYMBOLS } from "@/types/enum";

export default function CashsInputWithError<T>({ formik, formikName, label }: SingleInputWithErrorProps<T>) {
  const cashs = useCashs();
  const cashOptions = useMemo(() => cashs.map(c =>
    ({ id: c._id, name: c.name, object: <p>{c.name} {CURRENCY_SYMBOLS[c.currency]}</p> })),
    [cashs]);

  return (
    <SearchableTextInputWithError
      formik={formik}
      formikName={formikName}
      label={label}
      options={cashOptions}
      singleSelect
    />
  );
}
