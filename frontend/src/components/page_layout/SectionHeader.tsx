import { twMerge } from "tailwind-merge";

interface SectionHeaderProps extends React.ButtonHTMLAttributes<HTMLHeadingElement> {
  text: string;
  subtext?: string;
}

export default function SectionHeader({ text, subtext, ...props }: SectionHeaderProps) {
  return (
    <div className={"my-2 border-b border-second-bg p-1"}>
      <h2 className={twMerge("text-xl font-bold", props.className || "")}>
        {text}
      </h2>
      {subtext && <p className="text-sm text-subtext">{subtext}</p>}
    </div>
  );
}
