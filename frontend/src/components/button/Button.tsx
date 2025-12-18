import { twMerge } from "tailwind-merge";
import MultilineText from "../MultilineText";
import { PropsWithChildren } from "react";


const classes = {
  base: "relative flex items-center justify-center px-4 py-2 border rounded-xl transition cursor-pointer",
  disabled: "disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-300 disabled:border-gray-200",
  positive: "bg-green-100 hover:bg-green-200 text-green-800 border-green-300",
  negative: "bg-red-100 hover:bg-red-200 text-red-800 border-red-300",
  neutral: "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300",
};


export interface ButtonProps extends PropsWithChildren, React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  textInvisible?: boolean;
  action: "positive" | "negative" | "neutral";
}


export default function Button({ text, textInvisible = false, action, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      type="button"
      className={twMerge(classes.base, classes.disabled, classes[action], props.className)}
    >
      {children}
      <p className={textInvisible ? "invisible" : ""}><MultilineText text={text} /></p>
    </button>
  );
}
