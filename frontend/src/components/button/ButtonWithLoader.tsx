'use client';

import { useState } from "react";
import { RiLoader5Fill } from "react-icons/ri";
import { twMerge } from "tailwind-merge";


const classes = {
  base: "relative flex items-center justify-center px-4 py-2 border rounded-xl transition cursor-pointer",
  disabled: "disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-300 disabled:border-gray-200",
  positive: "bg-green-100 hover:bg-green-200 text-green-800 border-green-300",
  negative: "bg-red-100 hover:bg-red-200 text-red-800 border-red-300",
  neutral: "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300",
};


export interface ButtonWithLoaderProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => Promise<void>;
  text: string;
  action: "positive" | "negative" | "neutral";
}


export default function ButtonWithLoader({ onClick, text, action, ...props }: ButtonWithLoaderProps) {
  const [loading, setLoading] = useState(false);
  const disabled = props.disabled || loading;

  const handleClick = async () => {
    setLoading(true);
    console.log("loading", loading);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
    console.log("loading", loading);
  };

  return (
    <button
      {...props}
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={twMerge(classes.base, classes.disabled, classes[action], props.className)}
    >
      <RiLoader5Fill size={24} className={loading ? "animate-spin absolute " : "hidden"} />
      <p className={loading ? "invisible" : ""}>{text}</p>
    </button>
  );
}
