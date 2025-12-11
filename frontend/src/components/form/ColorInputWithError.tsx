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
  .transform((s) => s.length === 6 ? s + "ff" : s)
  .transform((s) => `#${s}`);


export default function ColorInputWithError<T>({ formik, formikName, label }: SingleInputWithErrorProps<T>) {
  const value = getValue(formik, formikName) as string || '#ff0000';
  return (
    <>
      <InputWithError<T> formik={formik} formikNames={[formikName]} label={label}>
        <HexColorPicker
          color={value}
          onChange={(color) => formik.setFieldValue(formikName as string, color)}
          style={{ width: '100%', height: '24px' }}
        />
      </InputWithError>
      <style>{`
                .react-colorful__saturation { display: none; }
                .react-colorful__hue { border-radius: 8px; height: 16px; margin-top: 4px; }
            `}</style>
    </>
  );
}
