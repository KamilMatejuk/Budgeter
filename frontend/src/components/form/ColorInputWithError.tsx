import React from 'react';
import { HexColorPicker } from 'react-colorful';
import InputWithError, { getValue, SingleInputWithErrorProps } from './InputWithError';
import { z } from 'zod';
import { ERROR } from '@/const/message';


export const requiredColor = z.string().min(1, ERROR.requiredError)
  .transform((s) => (typeof s !== "string") ? s : s.replace(/^#/, "").toLowerCase())
  .refine((s) => /^[0-9a-f]{6}$/.test(s) || /^[0-9a-f]{8}$/.test(s), {
    message: "Must be a 6- or 8-digit hex color",
  })
  .transform((s) => s.length === 8 ? s.slice(0, 6) : s)
  .transform((s) => `#${s}`);


export default function ColorInputWithError<T>({ formik, formikName, label }: SingleInputWithErrorProps<T>) {
  const value = getValue(formik, formikName) as string || '#ff0000';
  return (
    <>
      <InputWithError<T> formik={formik} formikNames={[formikName]} label={label}>
        <HexColorPicker
          color={value}
          onChange={(color) => formik.setFieldValue(formikName as string, color)}
          style={{ width: '100%', height: '70px' }}
        />
      </InputWithError>
      <style>
        {`
        .react-colorful__hue {
          position: absolute;
          bottom: 0;
          width: 100%;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
        .react-colorful__saturation {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
        `}
      </style>
    </>
  );
}
