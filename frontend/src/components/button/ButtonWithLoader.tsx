'use client';

import { useState } from "react";
import { RiLoader5Fill } from "react-icons/ri";
import Button, { ButtonProps } from "./Button";


export interface ButtonWithLoaderProps extends Omit<ButtonProps, "children" | "textInvisible"> {
  onClick: () => Promise<void>;
}


export default function ButtonWithLoader({ onClick, ...props }: ButtonWithLoaderProps) {
  const [loading, setLoading] = useState(false);
  const disabled = props.disabled || loading;

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled}
      textInvisible={loading}
    >
      <RiLoader5Fill size={24} className={loading ? "animate-spin absolute " : "hidden"} />
    </Button >
  );
}
