import { twMerge } from "tailwind-merge";
import Button, { ButtonProps } from "./Button";
import Link from "next/link";


interface ButtonWithLinkProps extends Omit<ButtonProps, "children" | "textInvisible"> {
  href: string;
}

export default function ButtonWithLink({ href, ...props }: ButtonWithLinkProps) {
  return (
    <Link href={href} className={twMerge("inline-block", props.className)}>
      <Button {...props} className="w-full"/>
    </Link >
  );
}
