import { twMerge } from "tailwind-merge";

interface PageHeaderProps extends React.ButtonHTMLAttributes<HTMLHeadingElement> {
  text: string;
  subtext?: string;
}

export default function PageHeader({ text, subtext, ...props }: PageHeaderProps) {
  return (
    <header className={"mb-4 border-b border-line p-1"}>
      <h1 className={twMerge("text-2xl font-bold", props.className || "")}>
        {text}
      </h1>
      {subtext && <p className="text-sm text-subtext">{subtext}</p>}
    </header>
  );
}
