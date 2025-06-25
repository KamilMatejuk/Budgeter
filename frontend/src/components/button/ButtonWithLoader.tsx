import { useState } from "react";
import { RiLoader5Fill } from "react-icons/ri";
import { twMerge } from "tailwind-merge";

interface ButtonWithLoaderProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => Promise<void>;
  text: string;
  destructive?: boolean;
}

export default function ButtonWithLoader({
  onClick,
  text,
  destructive,
  ...props
}: ButtonWithLoaderProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      {...props}
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={twMerge(
        "relative flex items-center justify-center px-4 py-2 border rounded-xl transition",
        "cursor-pointer disabled:cursor-not-allowed",
        destructive
          ? "bg-red-100 hover:bg-red-200 text-red-800 border-red-300 "
          : "bg-green-100 hover:bg-green-200 text-green-800 border-green-300 ",
        props.className || ""
      )}
    >
      <RiLoader5Fill
        size={24}
        className={loading ? "animate-spin absolute " : "hidden"}
      />
      <p className={loading ? "invisible" : ""}>{text}</p>
    </button>
  );
}
