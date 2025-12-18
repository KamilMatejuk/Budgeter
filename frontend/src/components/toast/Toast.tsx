import { twMerge } from "tailwind-merge";
import MultilineText from "../MultilineText";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
  color: string;
}

export default function Toast({ message, color, ...props }: ToastProps) {
  return (
    <div
      {...props}
      className={twMerge("p-2 rounded-lg border", props.className)}
      style={{ color, borderColor: color, backgroundColor: `${color}20` }}
    >
      <p className="text-center">{<MultilineText text={message} />}</p>
    </div>
  );
}
